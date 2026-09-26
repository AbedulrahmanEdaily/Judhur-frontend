import { createBrowserRouter } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import NotFoundPage from '../features/errors/pages/NotFoundPage.jsx';
import RouteErrorPage from '../features/errors/pages/RouteErrorPage.jsx';
import { RequireGuest } from '../routes/RequireGuest.jsx';

/** Loads a default-exported page for a lazy route. */
const page = (load) => async () => ({ Component: (await load()).default });

// Shown while the first lazy page loads.
const pageLoading = (
  <div className="flex min-h-dvh items-center justify-center text-brand">
    <Spinner size={28} />
  </div>
);

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: pageLoading,
    children: [
      { index: true, lazy: page(() => import('../features/properties/pages/HomePage.jsx')) },
      // Eager: the error page renders it too.
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: pageLoading,
    children: [
      {
        // Signed-in users skip these (and return to `?redirect=` right after logging in).
        element: <RequireGuest />,
        children: [
          { path: 'login', lazy: page(() => import('../features/auth/pages/LoginPage.jsx')) },
          { path: 'register', lazy: page(() => import('../features/auth/pages/RegisterPage.jsx')) },
          {
            path: 'register/check-email',
            lazy: page(() => import('../features/auth/pages/CheckEmailPage.jsx')),
          },
          {
            path: 'forgot-password',
            lazy: page(() => import('../features/auth/pages/ForgotPasswordPage.jsx')),
          },
          {
            path: 'reset-password',
            lazy: page(() => import('../features/auth/pages/ResetPasswordPage.jsx')),
          },
        ],
      },
      {
        path: 'confirm-email',
        lazy: page(() => import('../features/auth/pages/ConfirmEmailPage.jsx')),
      },
    ],
  },
]);
