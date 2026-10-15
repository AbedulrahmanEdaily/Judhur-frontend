import { baseApi } from '../../api/baseApi.js';
import { ADMIN_STATS_PATH, ADMIN_USERS_PATH } from '../../api/baseQuery.js';

/** `/api/v1/Admin/Users/{id}` with the id made safe for a URL. */
function adminUserPath(userId) {
  return `${ADMIN_USERS_PATH}/${encodeURIComponent(userId)}`;
}

/**
 * What a ban or an unban makes stale: the users list, this user, the dashboard numbers, and
 * the public listings and seller page (a ban pauses the listings and hides the seller).
 */
function banTags(userId) {
  return [
    'AdminUsers',
    { type: 'AdminUser', id: userId },
    'AdminStats',
    { type: 'SellerProfile', id: userId },
    { type: 'Property', id: 'LIST' },
  ];
}

// Admin dashboard and user management (the project guide 6.19), role Admin.
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** 200 → AdminStats. */
    getAdminStats: builder.query({
      query: () => ADMIN_STATS_PATH,
      providesTags: ['AdminStats'],
    }),

    /**
     * `?search=&status=&page=&pageSize=` → PaginatedList<AdminUser>, newest first. An empty
     * search is left out.
     */
    getAdminUsers: builder.query({
      query: ({ search, status, page, pageSize }) => {
        const params = { status, page, pageSize };
        if (search) params.search = search;
        return { url: ADMIN_USERS_PATH, params };
      },
      providesTags: ['AdminUsers'],
    }),

    /** 200 → AdminUser. 404 missing. */
    getAdminUser: builder.query({
      query: (userId) => adminUserPath(userId),
      providesTags: (_result, _error, userId) => [{ type: 'AdminUser', id: userId }],
    }),

    /**
     * Body: { reason } (required, ≤ 500). 204: signed out everywhere, listings paused. 409
     * Users.CannotBanAdmin / Users.CannotBanSelf / Users.AlreadyBanned.
     */
    banUser: builder.mutation({
      query: ({ userId, reason }) => ({
        url: `${adminUserPath(userId)}/ban`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { userId }) => banTags(userId),
    }),

    /** 204; the paused listings stay paused. 409 Users.NotBanned. */
    unbanUser: builder.mutation({
      query: (userId) => ({ url: `${adminUserPath(userId)}/unban`, method: 'POST' }),
      invalidatesTags: (_result, _error, userId) => banTags(userId),
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useBanUserMutation,
  useUnbanUserMutation,
} = usersApi;
