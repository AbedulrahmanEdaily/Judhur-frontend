import clsx from 'clsx';
import { formatNumber, formatRating } from '../../lib/format.js';
import { ar } from '../../locales/ar.js';
import { RatingStar } from './RatingStar.jsx';
import { STAR_POSITIONS, starFill } from './starFill.js';

const text = ar.reviews;

// Figma rating rows: the details seller box (67:1205) — 13px star, the value 12.5 semibold
// text/secondary, the count 11.5 muted; the seller header (73:1462) — 15px, 13.5 text/primary,
// 12.5 muted; a review card (73:1614) — five 13px stars, 3 apart.
const sizes = {
  sm: { star: 13, value: 'text-[12.5px] text-text-secondary', count: 'text-[11.5px]' },
  md: { star: 15, value: 'text-[13.5px] text-text', count: 'text-[12.5px]' },
};

/**
 * Read-only stars in half steps, with the average (one decimal, `showValue`) and «(N تقييم)»
 * when `count` is given. A count of 0 shows only «لا توجد تقييمات بعد».
 *
 * @param {{
 *   value?: number | null,
 *   count?: number,
 *   showValue?: boolean,
 *   size?: 'sm'|'md',
 *   className?: string,
 * }} props
 */
export function StarRating({ value, count, showValue = false, size = 'sm', className }) {
  const style = sizes[size];
  const rating = value ?? 0;

  if (count === 0) {
    return (
      <span className={clsx('leading-[1.74] text-muted', style.count, className)}>
        {text.noReviews}
      </span>
    );
  }

  return (
    <span className={clsx('inline-flex flex-wrap items-center gap-x-[5px]', className)}>
      <span
        role="img"
        aria-label={text.ratingLabel(formatRating(rating))}
        className="flex items-center gap-[3px]"
      >
        {STAR_POSITIONS.map((position) => (
          <RatingStar key={position} fill={starFill(rating, position)} size={style.star} />
        ))}
      </span>
      {showValue && (
        <span aria-hidden="true" className={clsx('leading-[1.74] font-semibold', style.value)}>
          {formatRating(rating)}
        </span>
      )}
      {count !== undefined && (
        <span className={clsx('leading-[1.74] text-muted', style.count)}>
          {text.countLabel(formatNumber(count))}
        </span>
      )}
    </span>
  );
}
