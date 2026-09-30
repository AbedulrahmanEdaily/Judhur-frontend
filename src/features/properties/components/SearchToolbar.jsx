import { formatNumber } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { SortMenu } from './SortMenu.jsx';

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
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-raised px-[17px] py-[13px]">
      <p className="flex-1 text-[15px] leading-[1.7] font-bold text-text">
        {totalCount !== undefined && ar.search.count(formatNumber(totalCount))}
      </p>
      <SortMenu value={sort} onChange={onSortChange} />
    </div>
  );
}
