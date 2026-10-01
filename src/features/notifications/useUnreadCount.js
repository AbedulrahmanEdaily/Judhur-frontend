import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../auth/authSlice.js';
import { useGetUnreadCountQuery } from './notificationsApi.js';

const POLLING_INTERVAL = 60 * 1000;

/**
 * The unread notifications count for the bell and the sidebars. Every caller shares one cached
 * request, polled each minute and refetched when the window gets focus; skipped for guests.
 */
export function useUnreadCount() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data } = useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: POLLING_INTERVAL,
    refetchOnFocus: true,
  });

  let count = 0;
  if (data) count = data.count;
  return { count, isLoaded: data !== undefined };
}
