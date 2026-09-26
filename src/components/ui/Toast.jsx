import clsx from 'clsx';
import {
  IconClose15,
  IconToastCheck,
  IconToastError,
  IconToastUndo,
  IconToastWarning,
} from '../icons/index.js';
import { ar } from '../../locales/ar.js';

/** @typedef {'success'|'warning'|'error'|'neutral'} ToastTone */

// Figma "تنبيه / Toast" (45:786): نجاح / تحذير / خطأ / تراجع.
const tones = {
  success: { icon: IconToastCheck, circle: 'bg-success-soft text-success' },
  warning: { icon: IconToastWarning, circle: 'bg-warning-soft text-warning' },
  error: { icon: IconToastError, circle: 'bg-danger-soft text-danger' },
  neutral: { icon: IconToastUndo, circle: 'bg-inset text-text-secondary' },
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
        'flex w-full items-center gap-3 rounded-lg border border-border bg-raised px-[15px] py-[13px] shadow-toast',
        className,
      )}
    >
      <div className={clsx('shrink-0 rounded-full p-[7px]', circle)}>
        <Icon />
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
        <IconClose15 />
      </button>
    </div>
  );
}
