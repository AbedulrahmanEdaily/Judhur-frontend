import { baseApi } from '../../api/baseApi.js';
import { CONVERSATIONS_PATH } from '../../api/baseQuery.js';

/** Messages per request (the API default is 30, at most 100). */
export const MESSAGES_PAGE_SIZE = 30;

/** `/api/v1/User/Conversations/{id}` with the id made safe for a URL. */
function conversationPath(conversationId) {
  return `${CONVERSATIONS_PATH}/${encodeURIComponent(conversationId)}`;
}

/** A plain database 409 (no `code`): two requests started the same conversation at once. */
function isDatabaseConflict(error) {
  return error?.status === 409 && !error.data?.code;
}

// Conversations between a buyer and a seller (the project guide 6.16), role User.
export const conversationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Body: { propertyId, message }. 201 new / 200 existing → { conversationId, isNew, message }.
     * 404 not public · 409 ConversationErrors.CannotStartConversationWithSelf · 429. A double
     * click can meet the database 409; the conversation exists by then, so it is asked once more.
     */
    startConversation: builder.mutation({
      queryFn: async (body, _api, _extraOptions, baseQuery) => {
        const request = { url: CONVERSATIONS_PATH, method: 'POST', body };
        const result = await baseQuery(request);
        if (isDatabaseConflict(result.error)) return baseQuery(request);
        return result;
      },
      invalidatesTags: ['Conversations', 'UnreadMessages'],
    }),

    /** 200 → PaginatedList<ConversationSummary>, latest first. */
    getConversations: builder.query({
      query: ({ page, pageSize }) => ({ url: CONVERSATIONS_PATH, params: { page, pageSize } }),
      providesTags: ['Conversations'],
    }),

    /** 200 → { count } — unread messages in every conversation. */
    getUnreadMessagesCount: builder.query({
      query: () => `${CONVERSATIONS_PATH}/unread-count`,
      providesTags: ['UnreadMessages'],
    }),

    /** 200 → ConversationDetails. 404 missing or not yours. */
    getConversation: builder.query({
      query: (conversationId) => conversationPath(conversationId),
      providesTags: (_result, _error, conversationId) => [
        { type: 'Conversation', id: conversationId },
      ],
    }),

    /**
     * Pages of `{ items: Message[] (newest first), hasMore }`. The first page has no `before`;
     * each older page asks for the messages before the oldest one shown. New messages are added
     * to the cache (sent or pushed by the hub), never by fetching every page again.
     */
    getMessages: builder.infiniteQuery({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => {
          if (!lastPage.hasMore || lastPage.items.length === 0) return undefined;
          return lastPage.items[lastPage.items.length - 1].id;
        },
      },
      query: ({ queryArg, pageParam }) => {
        const params = { limit: MESSAGES_PAGE_SIZE };
        if (pageParam) params.before = pageParam;
        return { url: `${conversationPath(queryArg)}/messages`, params };
      },
      providesTags: (_result, _error, conversationId) => [
        { type: 'Conversation', id: conversationId },
      ],
    }),

    /** Body: { content } (1–2000 after trim). 201 → Message, added to the open chat. 429. */
    sendMessage: builder.mutation({
      query: ({ conversationId, content }) => ({
        url: `${conversationPath(conversationId)}/messages`,
        method: 'POST',
        body: { content },
      }),
      onQueryStarted: async ({ conversationId }, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(addMessageToChat(conversationId, data));
        } catch {
          // The composer shows the error and keeps the text.
        }
      },
      invalidatesTags: ['Conversations'],
    }),

    /** 204. The other party's messages in the open chat count as read at once. */
    markConversationRead: builder.mutation({
      query: (conversationId) => ({
        url: `${conversationPath(conversationId)}/read`,
        method: 'POST',
      }),
      onQueryStarted: (conversationId, { dispatch }) => {
        const now = new Date().toISOString();
        dispatch(
          conversationsApi.util.updateQueryData('getMessages', conversationId, (chat) => {
            for (const page of chat.pages) {
              for (const message of page.items) {
                if (!message.isMine && !message.readAtUtc) message.readAtUtc = now;
              }
            }
          }),
        );
      },
      invalidatesTags: ['UnreadMessages', 'Conversations'],
    }),
  }),
});

/**
 * Adds a message at the bottom of a cached chat (the newest page), once — the hub and the send
 * answer may both bring it. Does nothing when that chat is not loaded.
 *
 * @param {string} conversationId
 * @param {import('../../api/types.js').Message} message
 */
export function addMessageToChat(conversationId, message) {
  return conversationsApi.util.updateQueryData('getMessages', conversationId, (chat) => {
    for (const page of chat.pages) {
      if (page.items.some((item) => item.id === message.id)) return;
    }
    chat.pages[0].items.unshift(message);
  });
}

/**
 * The other party read the chat: my messages sent before `readAtUtc` get their double check.
 *
 * @param {string} conversationId
 * @param {string} readAtUtc
 */
export function markMyMessagesRead(conversationId, readAtUtc) {
  return conversationsApi.util.updateQueryData('getMessages', conversationId, (chat) => {
    for (const page of chat.pages) {
      for (const message of page.items) {
        if (message.isMine && !message.readAtUtc) message.readAtUtc = readAtUtc;
      }
    }
  });
}

export const {
  useStartConversationMutation,
  useGetConversationsQuery,
  useGetUnreadMessagesCountQuery,
  useGetConversationQuery,
  useGetMessagesInfiniteQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
} = conversationsApi;
