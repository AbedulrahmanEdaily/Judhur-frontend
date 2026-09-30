import { baseApi } from '../../api/baseApi.js';
import { FAVORITES_PATH } from '../../api/baseQuery.js';

// Favorites (the project guide 6.9), role User. Only the ids list for now — it gives the dashboard its
// «محفوظ بالمفضلة» count. The page, the list and the heart come in the favorites step.
export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** 200 → string[] of property ids. */
    getFavoriteIds: builder.query({
      query: () => `${FAVORITES_PATH}/ids`,
      providesTags: ['FavoriteIds'],
    }),
  }),
});

export const { useGetFavoriteIdsQuery } = favoritesApi;
