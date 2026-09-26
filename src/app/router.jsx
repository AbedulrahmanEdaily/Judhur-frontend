import { createBrowserRouter } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import NotFoundPage from '../features/errors/pages/NotFoundPage.jsx';
import RouteErrorPage from '../features/errors/pages/RouteErrorPage.jsx';

/** Loads a default-exported page for a lazy route. */
const page = (load) => async () => ({ Component: (await load()).default });

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    // Shown while the first lazy page loads.
    hydrateFallbackElement: (
      <div className="flex min-h-dvh items-center justify-center text-brand">
        <Spinner size={28} />
      </div>
    ),
    children: [
      { index: true, lazy: page(() => import('../features/properties/pages/HomePage.jsx')) },
      // Eager: the error page renders it too.
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
