import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { RetryBanner } from '../../../components/ui/RetryBanner.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { toProblem } from '../../../lib/http/problemDetails.js';
import {
  clearActiveConversation,
  setActiveConversation,
  takeBufferedMessages,
} from '../../../lib/realtime/chatHub.js';
import { ar } from '../../../locales/ar.js';
import { ChatComposer } from '../components/ChatComposer.jsx';
import { ChatHeader } from '../components/ChatHeader.jsx';
import { ChatMessages } from '../components/ChatMessages.jsx';
import {
  addMessageToChat,
  useGetConversationQuery,
  useGetMessagesInfiniteQuery,
  useMarkConversationReadMutation,
} from '../conversationsApi.js';

const text = ar.conversations;

/** The cached pages (each newest first, newest page first) as one list, oldest first. */
function oldestFirst(pages) {
  const messages = [];
  for (let p = pages.length - 1; p >= 0; p -= 1) {
    const items = pages[p].items;
    for (let i = items.length - 1; i >= 0; i -= 1) messages.push(items[i]);
  }
  return messages;
}

/** The error screen of the chat: «المحادثة غير موجودة» for a 404, else retry. */
function renderError(error, onRetry) {
  const problem = toProblem(error);
  if (problem.status === 404) {
    return (
      <div className="p-4">
        <EmptyState
          title={text.notFoundTitle}
          description={text.notFoundText}
          action={{ label: text.backToList, to: '/messages' }}
        />
      </div>
    );
  }
  let requestId;
  if (problem.status >= 500) requestId = problem.requestId;
  return (
    <div className="p-4">
      <ErrorState message={problem.message} requestId={requestId} onRetry={onRetry} />
    </div>
  );
}

/**
 * `/messages/:conversationId` — Figma "المحادثة" (76:1085), mobile 84:530: the header, the
 * messages (older pages on scroll) and the composer, inside MessagesPage (which also shows the
 * other party's name in the mobile top bar). New messages come from the hub or the send
 * answer straight into the cache (those pushed while the first page loads are added once it
 * arrives). While the page is visible, unread messages from the other party are marked read up
 * to the newest one on screen (on open and on each new one). A refresh that fails over cached
 * data keeps the chat and shows a retry banner.
 */
export default function ChatPage() {
  const { conversationId } = useParams();
  const dispatch = useDispatch();
  const conversation = useGetConversationQuery(conversationId);
  const chat = useGetMessagesInfiniteQuery(conversationId, {
    refetchOnMountOrArgChange: true,
    // My messages sent from another tab are not pushed to this one.
    refetchOnFocus: true,
  });
  const [markRead] = useMarkConversationReadMutation();
  const [isVisible, setIsVisible] = useState(() => document.visibilityState === 'visible');

  useEffect(() => {
    setActiveConversation(conversationId);
    return () => clearActiveConversation(conversationId);
  }, [conversationId]);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsVisible(document.visibilityState === 'visible');
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const isChatLoaded = Boolean(chat.data);
  useEffect(() => {
    if (!isChatLoaded) return;
    for (const message of takeBufferedMessages(conversationId)) {
      dispatch(addMessageToChat(conversationId, message));
    }
  }, [isChatLoaded, conversationId, dispatch]);

  let messages = [];
  if (chat.data) messages = oldestFirst(chat.data.pages);
  let newestUnreadFromThem = null;
  for (const message of messages) {
    if (!message.isMine && !message.readAtUtc) newestUnreadFromThem = message;
  }
  const upTo = newestUnreadFromThem?.id;
  const upToSentAtUtc = newestUnreadFromThem?.sentAtUtc;

  const lastReadUpToRef = useRef(null);
  useEffect(() => {
    if (!upTo || !isVisible || lastReadUpToRef.current === upTo) return;
    lastReadUpToRef.current = upTo;
    markRead({ conversationId, upTo, upToSentAtUtc });
  }, [upTo, upToSentAtUtc, isVisible, conversationId, markRead]);

  let body;
  if (conversation.error && !conversation.data) {
    body = renderError(conversation.error, conversation.refetch);
  } else if (chat.error && !chat.data) {
    body = renderError(chat.error, chat.refetch);
  } else if (!conversation.data || !chat.data) {
    body = (
      <div className="flex flex-1 flex-col gap-3.5 p-[22px]">
        <Skeleton className="h-12 w-1/2 rounded-lg" />
        <Skeleton className="ms-auto h-16 w-2/5 rounded-lg" />
        <Skeleton className="h-12 w-1/2 rounded-lg" />
      </div>
    );
  } else {
    const hasStaleData = Boolean(conversation.error || chat.error);
    body = (
      <>
        {hasStaleData && (
          <RetryBanner
            onRetry={() => {
              conversation.refetch();
              chat.refetch();
            }}
          />
        )}
        <ChatHeader conversation={conversation.data} />
        <ChatMessages
          messages={messages}
          hasOlder={chat.hasNextPage}
          isLoadingOlder={chat.isFetchingNextPage}
          onLoadOlder={() => chat.fetchNextPage()}
        />
        <ChatComposer
          key={conversationId}
          conversationId={conversationId}
          isParticipantGone={!conversation.data.otherParty}
        />
      </>
    );
  }

  return body;
}
