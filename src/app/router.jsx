import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import NotFoundPage from '../features/errors/pages/NotFoundPage.jsx';
import RouteErrorPage from '../features/errors/pages/RouteErrorPage.jsx';
import { RequireGuest } from '../routes/RequireGuest.jsx';
import { RequireRole } from '../routes/RequireRole.jsx';

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
      {
        path: 'properties',
        // The mobile search frame (83:599) has its own top bar.
        handle: { hideMobileTopBar: true },
        lazy: async () => ({
          Component: (await import('../features/properties/pages/SearchPage.jsx')).default,
        }),
      },
      {
        path: 'properties/:propertyId',
        // The mobile details frame (83:671) starts with the photo and ends with its own action bar.
        handle: { hideMobileTopBar: true, hideMobileTabBar: true },
        lazy: async () => ({
          Component: (await import('../features/properties/pages/PropertyDetailsPage.jsx')).default,
        }),
      },
      {
        // Seller and account pages: role User only (guests go to login, admins go home — admins
        // never post, own, or favorite listings).
        element: <RequireRole role="User" />,
        children: [
          {
            path: 'properties/new',
            // The mobile create frame (84:664) has its own top bar and a fixed action bar.
            handle: { hideMobileTopBar: true, hideMobileTabBar: true },
            lazy: async () => ({
              Component: (await import('../features/properties/pages/CreatePropertyPage.jsx'))
                .default,
            }),
          },
          {
            path: 'dashboard',
            handle: { hideMobileTopBar: true },
            lazy: async () => ({
              Component: (await import('../features/dashboard/pages/DashboardPage.jsx')).default,
            }),
          },
          {
            path: 'my-properties',
            handle: { hideMobileTopBar: true },
            lazy: async () => ({
              Component: (await import('../features/properties/pages/MyPropertiesPage.jsx'))
                .default,
            }),
          },
          {
            path: 'my-properties/:propertyId',
            handle: { hideMobileTopBar: true },
            lazy: async () => ({
              Component: (await import('../features/properties/pages/MyPropertyPage.jsx')).default,
            }),
          },
          {
            path: 'my-properties/:propertyId/edit',
            handle: { hideMobileTopBar: true },
            lazy: async () => ({
              Component: (await import('../features/properties/pages/EditPropertyPage.jsx'))
                .default,
            }),
          },
        ],
      },
      {
        // Admin moderation. The statistics page has no API yet, so /admin opens the queue.
        element: <RequireRole role="Admin" />,
        children: [
          { path: 'admin', element: <Navigate to="/admin/properties" replace /> },
          {
            path: 'admin/properties',
            lazy: async () => ({
              Component: (await import('../features/admin/pages/PendingPropertiesPage.jsx'))
                .default,
            }),
          },
          {
            path: 'admin/properties/:propertyId',
            lazy: async () => ({
              Component: (await import('../features/admin/pages/ReviewPropertyPage.jsx')).default,
            }),
          },
        ],
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
