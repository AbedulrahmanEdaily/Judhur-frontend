import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../auth/authSlice.js';
import { selectIsRealtimeConnected } from '../ui/uiSlice.js';
import { useGetUnreadCountQuery } from './notificationsApi.js';

const POLLING_INTERVAL = 60 * 1000;

/**
 * The unread notifications count for the bell and the sidebars. Every caller shares one cached
 * request, refetched when the window gets focus; skipped for guests. It is polled each minute
 * only while the real-time hub is down — connected, the hub pushes new notifications.
 */
export function useUnreadCount() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isRealtimeConnected = useSelector(selectIsRealtimeConnected);

  let pollingInterval = POLLING_INTERVAL;
  if (isRealtimeConnected) pollingInterval = 0;

  const { data } = useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval,
    refetchOnFocus: true,
  });

  let count = 0;
  if (data) count = data.count;
  return { count, isLoaded: data !== undefined };
}
