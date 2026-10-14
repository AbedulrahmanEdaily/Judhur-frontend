import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { clearActiveConversation, setActiveConversation } from '../../../lib/realtime/chatHub.js';
import { ar } from '../../../locales/ar.js';
import { ChatComposer } from '../components/ChatComposer.jsx';
import { ChatHeader } from '../components/ChatHeader.jsx';
import { ChatMessages } from '../components/ChatMessages.jsx';
import {
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
 * answer straight into the cache. While the page is visible, unread messages from the other
 * party are marked read (on open and on each new one).
 */
export default function ChatPage() {
  const { conversationId } = useParams();
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

  let messages = [];
  if (chat.data) messages = oldestFirst(chat.data.pages);
  const hasUnreadFromThem = messages.some((message) => !message.isMine && !message.readAtUtc);

  useEffect(() => {
    if (hasUnreadFromThem && isVisible) markRead(conversationId);
  }, [hasUnreadFromThem, isVisible, conversationId, markRead]);

  let body;
  if (conversation.error) {
    body = renderError(conversation.error, conversation.refetch);
  } else if (chat.error) {
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
    body = (
      <>
        <ChatHeader conversation={conversation.data} />
        <ChatMessages
          messages={messages}
          hasOlder={chat.hasNextPage}
          isLoadingOlder={chat.isFetchingNextPage}
          onLoadOlder={() => chat.fetchNextPage()}
        />
        <ChatComposer conversationId={conversationId} />
      </>
    );
  }

  return body;
}
