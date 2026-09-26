import { createBrowserRouter } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import NotFoundPage from '../features/errors/pages/NotFoundPage.jsx';
import RouteErrorPage from '../features/errors/pages/RouteErrorPage.jsx';
import { RequireGuest } from '../routes/RequireGuest.jsx';

// Shown while the first lazy page loads.
const pageLoading = (
  <div className="flex min-h-dvh items-center justify-center text-brand">
    <Spinner size={28} />
  </div>
);

// Pages are loaded on demand: each `lazy` returns the page's default export as the Component.
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: pageLoading,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('../features/properties/pages/HomePage.jsx')).default,
        }),
      },
      // Not lazy: the error page renders it too.
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // Auth screens have their own full-page layouts (no navbar), as in Figma.
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: pageLoading,
    children: [
      {
        // Signed-in users skip these (and return to `?redirect=` right after logging in).
        element: <RequireGuest />,
        children: [
          {
            path: 'login',
            lazy: async () => ({
              Component: (await import('../features/auth/pages/LoginPage.jsx')).default,
            }),
          },
          {
            path: 'register',
            lazy: async () => ({
              Component: (await import('../features/auth/pages/RegisterPage.jsx')).default,
            }),
          },
          {
            path: 'register/check-email',
            lazy: async () => ({
              Component: (await import('../features/auth/pages/CheckEmailPage.jsx')).default,
            }),
          },
          {
            path: 'forgot-password',
            lazy: async () => ({
              Component: (await import('../features/auth/pages/ForgotPasswordPage.jsx')).default,
            }),
          },
          {
            path: 'reset-password',
            lazy: async () => ({
              Component: (await import('../features/auth/pages/ResetPasswordPage.jsx')).default,
            }),
          },
        ],
      },
      {
        path: 'confirm-email',
        lazy: async () => ({
          Component: (await import('../features/auth/pages/ConfirmEmailPage.jsx')).default,
        }),
      },
    ],
  },
]);
