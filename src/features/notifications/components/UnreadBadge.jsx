import { formatNumber } from '../../../lib/format.js';

/**
 * The unread count on the bell (not in Figma): a small state/danger pill on the icon's corner,
 * like the queue count in the admin sidebar; «99+» above 99. Hidden by the caller at 0.
 *
 * @param {{ count: number }} props
 */
export function UnreadBadge({ count }) {
  let label = formatNumber(count);
  if (count > 99) label = `${formatNumber(99)}+`;

  return (
    <span
      aria-hidden="true"
      className="absolute -end-1.5 -top-1.5 min-w-[18px] rounded-full bg-danger px-1 text-center text-[10.5px] leading-[18px] font-semibold text-inverse"
    >
      {label}
    </span>
  );
}
