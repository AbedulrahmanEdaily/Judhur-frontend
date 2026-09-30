import { useId } from 'react';
import { IconSort } from '../../../components/icons/index.js';
import { formatNumber } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { SORT_OPTIONS } from '../constants.js';

/**
 * Figma "شريط الأدوات" (53:850): the result count, then the sort pill at the end. The grid/map
 * switch is left out — the search results have no coordinates yet (BACKEND_REQUESTS #7).
 *
 * @param {{
 *   totalCount?: number,
 *   sort: string,
 *   onSortChange: (sort: string) => void,
 * }} props
 */
export function SearchToolbar({ totalCount, sort, onSortChange }) {
  const sortId = useId();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-raised px-[17px] py-[13px]">
      <p className="flex-1 text-[15px] leading-[1.7] font-bold text-text">
        {totalCount !== undefined && ar.search.count(formatNumber(totalCount))}
      </p>
      <div className="relative flex items-center gap-2 rounded-[10px] border border-border bg-surface py-2 ps-[13px] pe-[13px] focus-within:ring-2 focus-within:ring-brand">
        <label htmlFor={sortId} className="text-[13px] leading-[1.7] text-muted">
          {ar.search.sortLabel}
        </label>
        <select
          id={sortId}
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="cursor-pointer appearance-none bg-transparent pe-[23px] text-[13.5px] leading-[1.7] font-semibold text-text outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <IconSort className="pointer-events-none absolute end-[13px] text-muted" />
      </div>
    </div>
  );
}
