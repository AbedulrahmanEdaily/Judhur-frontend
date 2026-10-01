import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery.js';

/**
 * The single RTK Query API. Features add their endpoints with `baseApi.injectEndpoints`.
 * No long `keepUnusedDataFor`: the server already caches public lists for 10 minutes.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Property',
    'MyProperties',
    'MyProperty',
    'Favorites',
    'FavoriteIds',
    'PendingProperties',
    'ReviewProperty',
    'Notifications',
    'UnreadCount',
    'MyProfile',
    'SellerProfile',
  ],
  endpoints: () => ({}),
});
