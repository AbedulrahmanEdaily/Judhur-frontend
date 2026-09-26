import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router';
import { selectCurrentUser, selectIsAuthenticated } from '../features/auth/authSlice.js';
import { loginPathFor } from './redirect.js';

/**
 * Layout route limited to one role, e.g. `<RequireRole role="Admin" />` for the admin area.
 * Guests go to login; signed-in users without the role go home.
 *
 * @param {{ role: import('../api/types.js').Role }} props
 */
export function RequireRole({ role }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to={loginPathFor(location)} replace />;
  if (!user?.roles.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
