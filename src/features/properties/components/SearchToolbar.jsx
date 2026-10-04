import { Link } from 'react-router';
import { IconMapPin } from '../../../components/icons/index.js';
import { formatNumber } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { SortMenu } from './SortMenu.jsx';

/**
 * Figma "شريط الأدوات" (53:850): the result count, then the sort pill at the end. In place of
 * the grid/map switch, «الخريطة» opens the same search on the map page.
 *
 * @param {{
 *   totalCount?: number,
 *   sort: string,
 *   onSortChange: (sort: string) => void,
 *   mapPath: string,
 * }} props
 */
export function SearchToolbar({ totalCount, sort, onSortChange, mapPath }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-raised px-[17px] py-[13px]">
      <p className="flex-1 text-[15px] leading-[1.7] font-bold text-text">
        {totalCount !== undefined && ar.search.count(formatNumber(totalCount))}
      </p>
      <Link
        to={mapPath}
        className="flex items-center gap-1.5 rounded-[10px] border border-border bg-surface px-[13px] py-2 text-[13px] leading-[1.7] font-semibold text-text transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <IconMapPin width={15} height={15} className="text-muted" />
        {ar.search.showMap}
      </Link>
      <SortMenu value={sort} onChange={onSortChange} />
    </div>
  );
}
