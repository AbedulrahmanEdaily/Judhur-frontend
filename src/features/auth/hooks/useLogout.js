import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useLogoutMutation } from '../authApi.js';
import { selectAuth, sessionEnded } from '../authSlice.js';

/** POST /logout, then always end the session locally (even if the call fails) and go home. */
export function useLogout() {
  const [logout, { isLoading }] = useLogoutMutation();
  const { refreshToken } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const run = async () => {
    try {
      if (refreshToken) await logout({ refreshToken }).unwrap();
    } catch {
      // Logging out locally is what matters; the server treats unknown tokens as logged out.
    } finally {
      dispatch(sessionEnded('logout'));
      navigate('/');
    }
  };

  return [run, { isLoading }];
}
