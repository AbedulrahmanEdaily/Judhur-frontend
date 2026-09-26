import { isRouteErrorResponse, useRouteError } from 'react-router';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import NotFoundPage from './NotFoundPage.jsx';

/** Shown when a route fails to load or render. */
export default function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <ErrorState onRetry={() => window.location.reload()} />
    </div>
  );
}
