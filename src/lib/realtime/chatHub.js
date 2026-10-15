import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { baseApi } from '../../api/baseApi.js';
import { freshAccessToken } from '../../api/baseQuery.js';
import { API_BASE_URL } from '../../config/env.js';
import { selectAuth, selectIsAuthenticated, sessionEnded } from '../../features/auth/authSlice.js';
import {
  addMessageToChat,
  conversationsApi,
  markMyMessagesRead,
} from '../../features/conversations/conversationsApi.js';
import { notificationsApi } from '../../features/notifications/notificationsApi.js';
import { noticeShown, realtimeConnectionChanged } from '../../features/ui/uiSlice.js';

// The one SignalR connection of the app (the project guide 6.17): new messages, read marks and
// notifications pushed by the server.

const HUB_URL = `${API_BASE_URL}/hubs/chat`;
const FIRST_RETRY_MS = 2000;
const MAX_RETRY_MS = 30000;

/** @type {{ getState: () => any, dispatch: (action: any) => any } | null} */
let store = null;
/** @type {import('@microsoft/signalr').HubConnection | null} */
let connection = null;
let connectedUserId = null;
let hasConnectedBefore = false;
let retryDelay = FIRST_RETRY_MS;
let retryTimer = null;
// The chat the user has open, if any — its new messages go straight into the page.
let activeConversationId = null;

/** The chat page tells the hub which conversation is on screen. */
export function setActiveConversation(conversationId) {
  activeConversationId = conversationId;
}

export function clearActiveConversation(conversationId) {
  if (activeConversationId === conversationId) activeConversationId = null;
}

/** @param {import('../../api/types.js').Message} message */
function handleMessageReceived(message) {
  if (message.conversationId === activeConversationId) {
    // The chat page sees the unread message and marks it read while visible.
    store.dispatch(addMessageToChat(message.conversationId, message));
  } else if (!message.isMine) {
    store.dispatch(
      conversationsApi.util.updateQueryData('getUnreadMessagesCount', undefined, (unread) => {
        unread.count += 1;
      }),
    );
  }
  // The list shows the new last message (or a conversation it did not have yet).
  store.dispatch(baseApi.util.invalidateTags(['Conversations']));
}

/** @param {import('../../api/types.js').MessagesReadEvent} event */
function handleMessagesRead({ conversationId, readAtUtc }) {
  store.dispatch(markMyMessagesRead(conversationId, readAtUtc));
}

/** The toast tone of a pushed notification: a warning for bad news, success otherwise. */
function noticeTone(type) {
  if (type === 'PropertyRejected' || type === 'PropertySuspended') return 'warning';
  return 'success';
}

/** @param {import('../../api/types.js').Notification} notification */
function handleNotificationReceived(notification) {
  // A ban ends the session here at once; the notification says why.
  if (notification.type === 'AccountBanned') {
    store.dispatch(sessionEnded('banned'));
    store.dispatch(noticeShown({ tone: 'error', message: notification.body }));
    return;
  }
  const cachedPages = notificationsApi.util.selectCachedArgsForQuery(
    store.getState(),
    'getNotifications',
  );
  for (const args of cachedPages) {
    if (args.page !== 1) continue;
    store.dispatch(
      notificationsApi.util.updateQueryData('getNotifications', args, (page) => {
        if (page.items.some((item) => item.id === notification.id)) return;
        page.items.unshift(notification);
        page.totalCount += 1;
        if (page.items.length > args.pageSize) page.items.pop();
      }),
    );
  }
  store.dispatch(
    notificationsApi.util.updateQueryData('getUnreadCount', undefined, (unread) => {
      unread.count += 1;
    }),
  );
  store.dispatch(noticeShown({ tone: noticeTone(notification.type), message: notification.title }));
}

/** After a gap in the connection: fetch what may have been missed while it was down. */
function catchUp() {
  const tags = ['Conversations', 'UnreadMessages', 'UnreadCount', 'Notifications'];
  if (activeConversationId) tags.push({ type: 'Conversation', id: activeConversationId });
  store.dispatch(baseApi.util.invalidateTags(tags));
}

function setConnected(isConnected) {
  store.dispatch(realtimeConnectionChanged(isConnected));
}

/** Tries again later (2 s, doubling up to 30 s) while the user is still signed in. */
function scheduleStart() {
  if (!connection || retryTimer) return;
  if (!selectIsAuthenticated(store.getState())) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
    connect();
  }, retryDelay);
}

async function connect() {
  const current = connection;
  if (!current) return;
  try {
    await current.start();
  } catch {
    if (current === connection) scheduleStart();
    return;
  }
  if (current !== connection) return; // stopped while starting
  retryDelay = FIRST_RETRY_MS;
  setConnected(true);
  if (hasConnectedBefore) catchUp();
  hasConnectedBefore = true;
}

function createConnection() {
  const created = new HubConnectionBuilder()
    // The access token goes in the WebSocket URL, so nothing about the connection is logged.
    .withUrl(HUB_URL, { accessTokenFactory: () => freshAccessToken(store) })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.None)
    .build();

  created.on('messageReceived', handleMessageReceived);
  created.on('messagesRead', handleMessagesRead);
  created.on('notificationReceived', handleNotificationReceived);

  created.onreconnecting(() => setConnected(false));
  created.onreconnected(() => {
    setConnected(true);
    catchUp();
  });
  // Closed for good — the server ends it when the token expires, or reconnecting gave up:
  // start again with a fresh token while still signed in.
  created.onclose(() => {
    if (created !== connection) return;
    setConnected(false);
    scheduleStart();
  });
  return created;
}

/** Stops the connection (logout, or a different user signed in). */
export function stopRealtime() {
  const current = connection;
  connection = null;
  connectedUserId = null;
  hasConnectedBefore = false;
  retryDelay = FIRST_RETRY_MS;
  clearTimeout(retryTimer);
  retryTimer = null;
  if (store) setConnected(false);
  if (current) current.stop().catch(() => {});
}

/**
 * Matches the connection to the session: connected while someone is signed in, restarted when
 * another account signs in (from another tab), stopped when signed out.
 *
 * @param {{ getState: () => any, dispatch: (action: any) => any }} appStore
 */
export function syncRealtime(appStore) {
  store = appStore;
  const { status, user } = selectAuth(store.getState());
  if (status !== 'authenticated') {
    stopRealtime();
    return;
  }
  if (connection && connectedUserId === user.id) return;
  stopRealtime();
  connection = createConnection();
  connectedUserId = user.id;
  connect();
}
