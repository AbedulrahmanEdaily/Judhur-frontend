import clsx from 'clsx';
import { badgeBaseClasses } from './Badge.jsx';
import { ar } from '../../locales/ar.js';

/** The "موثّق" badge — the only place the gold tokens are used. */
export function VerifiedBadge({ className }) {
  return (
    <span className={clsx(badgeBaseClasses, 'bg-verified-soft text-verified', className)}>
      {ar.badge.verified}
    </span>
  );
}
