import clsx from 'clsx';
import { IconToastCheck, IconToastError, IconToastWarning } from '../icons/index.js';
import { ar } from '../../locales/ar.js';

// Not in Figma: a form-level message built from the Toast colors and icons (45:786).
const toneClasses = {
  error: 'bg-danger-soft text-danger',
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
};

/**
 * Form-level message shown above the submit button. Errors are announced to screen readers.
 *
 * @param {{
 *   tone?: 'error'|'success'|'info',
 *   children: import('react').ReactNode,
 *   requestId?: string | null,
 * }} props
 */
export function FormAlert({ tone = 'error', children, requestId }) {
  let icon = <IconToastError />;
  if (tone === 'success') icon = <IconToastCheck />;
  if (tone === 'info') icon = <IconToastWarning />;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={clsx(
        'flex gap-2.5 rounded-md px-4 py-3 text-start text-body-sm',
        toneClasses[tone],
      )}
    >
      <span className="mt-1 shrink-0">{icon}</span>
      <div className="flex flex-col gap-1">
        <div>{children}</div>
        {requestId && (
          <p className="text-caption opacity-80">
            {ar.errors.requestId}:{' '}
            <span dir="ltr" className="font-mono select-all">
              {requestId}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
