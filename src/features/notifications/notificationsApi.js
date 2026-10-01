import { baseApi } from '../../api/baseApi.js';
import { NOTIFICATIONS_PATH } from '../../api/baseQuery.js';

/**
 * Marks notifications as read in every cached page now (`id` null = all of them) and lowers
 * the cached unread count; both are undone if the request fails. The tags refetch afterwards.
 */
async function markReadOptimistically(id, { dispatch, getState, queryFulfilled }) {
  const patches = [];
  let newlyRead = 0;

  const cachedPages = notificationsApi.util.selectCachedArgsForQuery(
    getState(),
    'getNotifications',
  );
  for (const args of cachedPages) {
    const patch = dispatch(
      notificationsApi.util.updateQueryData('getNotifications', args, (page) => {
        for (const notification of page.items) {
          if (id !== null && notification.id !== id) continue;
          if (!notification.isRead && id !== null) newlyRead = 1;
          notification.isRead = true;
        }
      }),
    );
    patches.push(patch);
  }

  const countPatch = dispatch(
    notificationsApi.util.updateQueryData('getUnreadCount', undefined, (unread) => {
      if (id === null) {
        unread.count = 0;
      } else {
        unread.count = Math.max(unread.count - newlyRead, 0);
      }
    }),
  );
  patches.push(countPatch);

  try {
    await queryFulfilled;
  } catch {
    for (const patch of patches) patch.undo();
  }
}

// Notifications (the project guide 6.11), any signed-in role.
export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** 200 → PaginatedList<Notification>, newest first. */
    getNotifications: builder.query({
      query: ({ page, pageSize }) => ({ url: NOTIFICATIONS_PATH, params: { page, pageSize } }),
      providesTags: ['Notifications'],
    }),

    /** 200 → { count }. Polled by useUnreadCount. */
    getUnreadCount: builder.query({
      query: () => `${NOTIFICATIONS_PATH}/unread-count`,
      providesTags: ['UnreadCount'],
    }),

    /** 204, also when it was already read; 404 missing or not yours. */
    markNotificationAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `${NOTIFICATIONS_PATH}/${notificationId}/read`,
        method: 'POST',
      }),
      onQueryStarted: (notificationId, api) => markReadOptimistically(notificationId, api),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),

    /** 204. */
    markAllNotificationsAsRead: builder.mutation({
      query: () => ({ url: `${NOTIFICATIONS_PATH}/read-all`, method: 'POST' }),
      onQueryStarted: (arg, api) => markReadOptimistically(null, api),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationsApi;
