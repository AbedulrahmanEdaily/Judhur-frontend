import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';

const text = ar.ownerProperty;

/**
 * When `GET /mine/{id}` fails: 404 (missing, deleted, or another user's) → back to «عقاراتي»;
 * anything else → the error with retry (and the request id for 500s).
 *
 * @param {{ error: unknown, onRetry: () => void }} props
 */
export function OwnerLoadError({ error, onRetry }) {
  const problem = toProblem(error);
  if (problem.status === 404) {
    return (
      <EmptyState
        title={text.notFoundTitle}
        description={text.notFoundText}
        action={{ label: text.backToList, to: '/my-properties' }}
      />
    );
  }

  let requestId;
  if (problem.status >= 500) requestId = problem.requestId;
  return <ErrorState message={problem.message} requestId={requestId} onRetry={onRetry} />;
}
