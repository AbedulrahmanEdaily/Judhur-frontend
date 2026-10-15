import { Link } from 'react-router';
import clsx from 'clsx';
import { formatNumber } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';

const noteToneClasses = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
};

const cardClasses =
  'flex flex-col gap-2 rounded-lg border border-border bg-raised p-4 xl:p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/**
 * One number of the dashboard — Figma stat card (80:638): bg/raised, border/subtle, radius lg,
 * 20 padding; the label 12.5 muted at the start, a pill (11.5 semibold) at the end, the value 27
 * bold. With `to` the whole card is a link to that list.
 *
 * @param {{
 *   label: string,
 *   value: number,
 *   note?: string,
 *   noteTone?: 'success'|'warning'|'danger',
 *   to?: string,
 * }} props
 */
export function StatCard({ label, value, note, noteTone = 'success', to }) {
  const body = (
    <>
      <span className="flex items-center gap-2">
        <span className="min-w-0 flex-1 text-[12.5px] leading-[1.72] text-muted">{label}</span>
        {note && (
          <span
            className={clsx(
              'shrink-0 rounded-full px-[9px] py-[3px] text-[11.5px] leading-[1.72] font-semibold',
              noteToneClasses[noteTone],
            )}
          >
            {note}
          </span>
        )}
      </span>
      <span className="text-[24px] leading-[1.72] font-bold text-text xl:text-[27px]">
        {formatNumber(value)}
      </span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        aria-label={ar.admin.dashboard.open(`${formatNumber(value)} ${label}`)}
        className={clsx(cardClasses, 'transition-colors hover:border-brand')}
      >
        {body}
      </Link>
    );
  }
  return <div className={cardClasses}>{body}</div>;
}
