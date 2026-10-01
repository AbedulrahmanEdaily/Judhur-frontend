import { baseApi } from '../../api/baseApi.js';
import { FAVORITES_PATH } from '../../api/baseQuery.js';

/**
 * Sends a favorite change. `alreadyStatus` (409 on add, 404 on remove) means the server already
 * has the wanted state, so it counts as success — `alreadyDone` then refetches the ids.
 */
async function sendFavoriteChange(baseQuery, args, alreadyStatus) {
  const result = await baseQuery(args);
  if (result.error && result.error.status === alreadyStatus) return { data: { alreadyDone: true } };
  if (result.error) return { error: result.error };
  return { data: { alreadyDone: false } };
}

/** Puts the id in (or takes it out of) the cached ids list now, and undoes it on failure. */
async function updateIdsOptimistically(propertyId, isFavorite, { dispatch, queryFulfilled }) {
  const patch = dispatch(
    favoritesApi.util.updateQueryData('getFavoriteIds', undefined, (ids) => {
      const index = ids.indexOf(propertyId);
      if (isFavorite && index === -1) ids.push(propertyId);
      if (!isFavorite && index !== -1) ids.splice(index, 1);
    }),
  );
  try {
    await queryFulfilled;
  } catch {
    patch.undo();
  }
}

/** The list always changes; the ids are refetched only when the server already had the state. */
function changedTags(result) {
  if (result && result.alreadyDone) return ['Favorites', 'FavoriteIds'];
  return ['Favorites'];
}

// Favorites (the project guide 6.9), role User only.
export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** 200 → PaginatedList<PropertySummary>, the most recently added first. */
    getFavorites: builder.query({
      query: ({ page, pageSize }) => ({ url: FAVORITES_PATH, params: { page, pageSize } }),
      providesTags: ['Favorites'],
    }),

    /** 200 → string[] of property ids. Read through useFavoriteIds, once for the whole app. */
    getFavoriteIds: builder.query({
      query: () => `${FAVORITES_PATH}/ids`,
      providesTags: ['FavoriteIds'],
    }),

    /** 204; 404 not public; 409 already a favorite (success here). */
    addFavorite: builder.mutation({
      queryFn: (propertyId, api, extraOptions, baseQuery) =>
        sendFavoriteChange(
          baseQuery,
          { url: `${FAVORITES_PATH}/${propertyId}`, method: 'POST' },
          409,
        ),
      onQueryStarted: (propertyId, api) => updateIdsOptimistically(propertyId, true, api),
      invalidatesTags: changedTags,
    }),

    /** 204; 404 not in favorites (success here). */
    removeFavorite: builder.mutation({
      queryFn: (propertyId, api, extraOptions, baseQuery) =>
        sendFavoriteChange(
          baseQuery,
          { url: `${FAVORITES_PATH}/${propertyId}`, method: 'DELETE' },
          404,
        ),
      onQueryStarted: (propertyId, api) => updateIdsOptimistically(propertyId, false, api),
      invalidatesTags: changedTags,
    }),
  }),
});

export const {
  useGetFavoritesQuery,
  useGetFavoriteIdsQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoritesApi;
