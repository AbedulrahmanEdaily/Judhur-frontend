import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useLogoutMutation } from '../authApi.js';
import { selectAuth, sessionEnded } from '../authSlice.js';

/**
 * Used by the desktop account menu and the mobile tab bar.
 * Calls POST /logout, then always ends the session locally (even if the call fails) and goes home.
 */
export function useLogout() {
  const [logoutRequest, { isLoading }] = useLogoutMutation();
  const { refreshToken } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function logout() {
    try {
      if (refreshToken) {
        await logoutRequest({ refreshToken }).unwrap();
      }
    } catch {
      // The server treats an unknown token as already logged out, so a failure here is fine.
    }
    dispatch(sessionEnded('logout'));
    navigate('/');
  }

  return { logout, isLoggingOut: isLoading };
}
