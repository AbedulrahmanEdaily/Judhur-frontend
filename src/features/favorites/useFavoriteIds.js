import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAdmin, selectIsAuthenticated } from '../auth/authSlice.js';
import { useGetFavoriteIdsQuery } from './favoritesApi.js';

const NO_IDS = [];

// One Set per ids list, shared by every card; it is built again only when the list changes.
const selectIdSet = createSelector([(ids) => ids], (ids) => new Set(ids));

/**
 * The signed-in user's favorite ids as a Set, so each card does a Set lookup. `GET /ids` is
 * called once and cached; it is skipped for guests and admins (they have no favorites).
 */
export function useFavoriteIds() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const canFavorite = isAuthenticated && !isAdmin && Boolean(user?.roles.includes('User'));

  const { favoriteIds, count, isLoaded } = useGetFavoriteIdsQuery(undefined, {
    skip: !canFavorite,
    selectFromResult: ({ data }) => ({
      favoriteIds: selectIdSet(data ?? NO_IDS),
      count: data?.length ?? 0,
      isLoaded: data !== undefined,
    }),
  });

  return { canFavorite, favoriteIds, count, isLoaded };
}
