import { useStore } from 'react-redux';
import { useNavigate } from 'react-router';
import { useLogoutMutation } from '../authApi.js';
import { selectAuth } from '../authSlice.js';

/** Router state that tells AppLayout to end the session once the home page is on screen. */
const END_SESSION_STATE = { endSession: true };

/**
 * Used by the desktop account menu, the mobile tab bar and the dashboard.
 * Calls POST /logout, then always goes home and ends the session locally (even if the call
 * fails). The session ends only after the home page is shown (AppLayout does it): a
 * signed-in-only page still on screen would otherwise send the user to login.
 */
export function useLogout() {
  const [logoutRequest, { isLoading }] = useLogoutMutation();
  const store = useStore();
  const navigate = useNavigate();

  async function logout() {
    // Read at click time: a refresh may have replaced the token since the last render.
    const { refreshToken } = selectAuth(store.getState());
    try {
      if (refreshToken) {
        await logoutRequest({ refreshToken }).unwrap();
      }
    } catch {
      // The server treats an unknown token as already logged out, so a failure here is fine.
    }
    navigate('/', { replace: true, state: END_SESSION_STATE });
  }

  return { logout, isLoggingOut: isLoading };
}
