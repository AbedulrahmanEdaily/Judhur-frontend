import clsx from 'clsx';
import { ar } from '../../locales/ar.js';

/** The "موثّق" badge — the only place the gold tokens are used. */
export function VerifiedBadge({ className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full bg-verified-soft px-3 py-[5px] text-[12px] leading-[1.6] font-semibold whitespace-nowrap text-verified',
        className,
      )}
    >
      {ar.badge.verified}
    </span>
  );
}
