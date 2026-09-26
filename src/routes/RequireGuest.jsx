import { useSelector } from 'react-redux';
import { Navigate, Outlet, useSearchParams } from 'react-router';
import { selectIsAuthenticated } from '../features/auth/authSlice.js';
import { safeRedirectPath } from './redirect.js';

/**
 * Layout route for login/register/password pages: a signed-in user skips them. Right after a
 * login this also sends the user on to the `?redirect=` page they came from.
 */
export function RequireGuest() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    return <Navigate to={safeRedirectPath(searchParams.get('redirect'))} replace />;
  }
  return <Outlet />;
}
