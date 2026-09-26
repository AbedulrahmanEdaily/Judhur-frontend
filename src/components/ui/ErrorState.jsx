import clsx from 'clsx';
import { IconWarning20 } from '../icons/index.js';
import { Button } from './Button.jsx';
import { ar } from '../../locales/ar.js';

/**
 * Error counterpart of `<EmptyState>` — not in Figma. It reuses the Empty State layout (45:787)
 * with state/danger colors, the Figma warning icon (48:775) and a secondary Button, plus the
 * request id (selectable) so a 500 can be reported.
 *
 * @param {{
 *   title?: string,
 *   message?: string,
 *   requestId?: string,
 *   onRetry?: () => void,
 *   className?: string,
 * }} props
 */
export function ErrorState({
  title = ar.errors.unexpected,
  message,
  requestId,
  onRetry,
  className,
}) {
  return (
    <div
      role="alert"
      className={clsx(
        'flex flex-col items-center gap-3.5 rounded-lg border border-dashed border-border bg-surface px-[31px] py-[47px] text-center',
        className,
      )}
    >
      <div className="rounded-full bg-danger-soft p-[18px] text-danger">
        <IconWarning20 width={30} height={30} />
      </div>
      <h2 className="text-[18px] leading-[1.75] font-bold text-text">{title}</h2>
      {message && <p className="text-[13.5px] leading-[1.75] text-text-secondary">{message}</p>}
      {requestId && (
        <p className="text-caption text-muted">
          {ar.errors.requestId}:{' '}
          <span dir="ltr" className="font-mono select-all">
            {requestId}
          </span>
        </p>
      )}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {ar.common.retry}
        </Button>
      )}
    </div>
  );
}
