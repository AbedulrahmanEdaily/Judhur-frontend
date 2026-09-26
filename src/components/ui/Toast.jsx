import clsx from 'clsx';
import { Check, RotateCcw, TriangleAlert, X } from 'lucide-react';
import { ar } from '../../locales/ar.js';

/** @typedef {'success'|'warning'|'error'|'neutral'} ToastTone */

// Figma "تنبيه / Toast": نجاح / تحذير / خطأ / تراجع.
const tones = {
  success: { icon: Check, circle: 'bg-success-soft text-success' },
  warning: { icon: TriangleAlert, circle: 'bg-warning-soft text-warning' },
  error: { icon: X, circle: 'bg-danger-soft text-danger' },
  neutral: { icon: RotateCcw, circle: 'bg-inset text-text-secondary' },
};

/**
 * A single toast — icon at the start, message, optional action, close at the end.
 *
 * @param {{
 *   tone?: ToastTone,
 *   message: string,
 *   action?: { label: string, onClick: () => void },
 *   onClose: () => void,
 *   className?: string,
 * }} props
 */
export function Toast({ tone = 'success', message, action, onClose, className }) {
  const { icon: Icon, circle } = tones[tone];

  return (
    <div
      className={clsx(
        'flex w-full items-center gap-3 rounded-lg border border-border bg-raised px-4 py-3.5 shadow-toast',
        className,
      )}
    >
      <div className={clsx('shrink-0 rounded-full p-[7px]', circle)}>
        <Icon size={16} aria-hidden="true" />
      </div>
      <p className="flex-1 text-[13.5px] leading-[1.75] text-text">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 rounded-sm bg-inset px-3.5 py-[7px] text-[13px] leading-[1.72] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label={ar.common.close}
        className="shrink-0 rounded-sm text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-brand"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
