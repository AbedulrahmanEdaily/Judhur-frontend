import { Link } from 'react-router';
import { IconBackChevron, IconFilter, IconMapPin } from '../../../components/icons/index.js';
import { formatNumber } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { PROPERTY_STATUS_LABELS, PROPERTY_TYPE_PLURALS } from '../constants.js';
import { countActiveFilters } from '../searchFilters.js';

const text = ar.search;

/**
 * "أراضي للبيع في نابلس" (desktop) or "أراضي في نابلس" (mobile, no purpose). With several
 * types ticked the title stays «العقارات»; with several cities it names none.
 */
function searchTitle(filters, withPurpose) {
  let title = text.allProperties;
  if (filters.propertyType.length === 1) title = PROPERTY_TYPE_PLURALS[filters.propertyType[0]];
  if (withPurpose && filters.propertyStatus) {
    title = `${title} ${PROPERTY_STATUS_LABELS[filters.propertyStatus]}`;
  }
  if (filters.city.length === 1) title = `${title} ${text.in(filters.city[0])}`;
  return title;
}

/**
 * The top of the search page. Desktop: breadcrumbs and title (52:852). Mobile: the top bar with
 * back and title (83:604), then the result count and the «فلاتر» button (83:611).
 *
 * @param {{
 *   filters: import('../searchFilters.js').SearchFilters,
 *   totalCount?: number,
 *   onOpenFilters: () => void,
 *   mapPath: string,
 * }} props
 */
export function SearchHeader({ filters, totalCount, onOpenFilters, mapPath }) {
  return (
    <>
      {/* Mobile top bar (83:604): back, then the title. */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border border-border bg-bg px-[17px] pt-[9px] pb-[11px] xl:hidden">
        <Link
          to="/"
          aria-label={text.back}
          className="rounded-sm text-text focus-visible:outline-2 focus-visible:outline-brand"
        >
          <IconBackChevron />
        </Link>
        <h1 className="text-[16px] leading-[1.72] font-bold text-text">
          {searchTitle(filters, false)}
        </h1>
      </header>

      {/* Mobile tools (83:611): count, then the filters button. */}
      <div className="flex items-center gap-2 px-4 py-3 xl:hidden">
        <p className="flex-1 text-[13.5px] leading-[1.72] font-bold text-text">
          {totalCount !== undefined && text.mobileCount(formatNumber(totalCount))}
        </p>
        {/* Not in the mobile Figma frame: the same search on the map. */}
        <Link
          to={mapPath}
          className="flex items-center gap-1.5 rounded-full border border-border bg-raised px-3.5 py-2 text-[12.5px] leading-[1.72] font-semibold text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <IconMapPin width={14} height={14} className="text-muted" />
          {text.showMap}
        </Link>
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex items-center gap-[7px] rounded-full bg-brand px-3.5 py-2 text-[12.5px] leading-[1.72] font-semibold text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <IconFilter />
          {text.mobileFilters(countActiveFilters(filters))}
        </button>
      </div>

      {/* Desktop header (52:852): breadcrumbs and title. */}
      <div className="hidden flex-col gap-2 bg-bg px-20 pt-7 pb-6 xl:flex">
        <nav aria-label={ar.common.breadcrumb}>
          <ol className="flex items-center gap-2 text-[12.5px] leading-[1.7] text-muted">
            <li>
              <Link to="/" className="text-brand-text">
                {ar.nav.home}
              </Link>
            </li>
            {filters.city.length === 1 && <li aria-hidden="true">/</li>}
            {filters.city.length === 1 && <li>{filters.city[0]}</li>}
            {filters.propertyType.length === 1 && <li aria-hidden="true">/</li>}
            {filters.propertyType.length === 1 && (
              <li>{PROPERTY_TYPE_PLURALS[filters.propertyType[0]]}</li>
            )}
          </ol>
        </nav>
        <h1 className="text-[27px] leading-[1.7] font-bold text-text">
          {searchTitle(filters, true)}
        </h1>
      </div>
    </>
  );
}
