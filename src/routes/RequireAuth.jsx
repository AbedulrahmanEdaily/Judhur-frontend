import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router';
import { selectIsAuthenticated } from '../features/auth/authSlice.js';
import { loginPathFor } from './redirect.js';

/** Layout route for pages that need a session; guests go to login and come back after. */
export function RequireAuth() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to={loginPathFor(location)} replace />;
  return <Outlet />;
}
