import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../auth/authSlice.js';
import { useGetMeQuery } from './profileApi.js';

/**
 * The signed-in user's profile (`GET /me`), shared by every caller through one cached request.
 * Skipped for guests; a session start or end resets the cache, so it is fetched again after a
 * login (email or Google) and dropped on logout.
 */
export function useMyProfile() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data, isLoading, error, refetch } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });
  return { profile: data, isLoading, error, refetch };
}
