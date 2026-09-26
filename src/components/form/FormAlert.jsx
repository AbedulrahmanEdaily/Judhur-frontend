import clsx from 'clsx';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { ar } from '../../locales/ar.js';

const tones = {
  error: { icon: CircleAlert, classes: 'bg-danger-soft text-danger' },
  success: { icon: CircleCheck, classes: 'bg-success-soft text-success' },
  info: { icon: Info, classes: 'bg-info-soft text-info' },
};

/**
 * Form-level message (above the submit button). Errors are announced to screen readers.
 *
 * @param {{
 *   tone?: 'error'|'success'|'info',
 *   children: import('react').ReactNode,
 *   requestId?: string | null,
 *   className?: string,
 * }} props
 */
export function FormAlert({ tone = 'error', children, requestId, className }) {
  const { icon: Icon, classes } = tones[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={clsx('flex gap-2.5 rounded-md px-4 py-3 text-body-sm', classes, className)}
    >
      <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
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
