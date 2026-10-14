import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../auth/authSlice.js';
import { selectIsRealtimeConnected } from '../ui/uiSlice.js';
import { useGetUnreadMessagesCountQuery } from './conversationsApi.js';

const POLLING_INTERVAL = 60 * 1000;

/**
 * The unread messages count for the navbar, the sidebar and the tab bar. One shared cached
 * request, refetched on window focus; polled each minute only while the real-time hub is down
 * (the hub pushes new messages). Skipped for guests and admins (they have no conversations).
 */
export function useUnreadMessages() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const isRealtimeConnected = useSelector(selectIsRealtimeConnected);
  const canChat = isAuthenticated && Boolean(user?.roles.includes('User'));

  let pollingInterval = POLLING_INTERVAL;
  if (isRealtimeConnected) pollingInterval = 0;

  const { data } = useGetUnreadMessagesCountQuery(undefined, {
    skip: !canChat,
    pollingInterval,
    refetchOnFocus: true,
  });

  let count = 0;
  if (data) count = data.count;
  return { canChat, count, isLoaded: data !== undefined };
}
