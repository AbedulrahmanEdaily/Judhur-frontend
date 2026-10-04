import { Link } from 'react-router';
import { IconSort } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import {
  LAND_CLASSIFICATION_LABELS,
  LEGAL_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from '../../properties/constants.js';
import { formatPriceRange, searchPath } from '../../properties/searchFilters.js';

const text = ar.map;
const searchText = ar.search;

const pillClasses =
  'flex shrink-0 items-center gap-[7px] rounded-md border border-border bg-surface py-2 ps-[13px] pe-[11px] text-[13.5px] leading-[1.7] whitespace-nowrap text-text transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/** A pill's text: its title, the one chosen value, or the title with the count. */
function pillLabel(title, values) {
  if (values.length === 1) return values[0];
  if (values.length > 1) return text.filterCount(title, values.length);
  return title;
}

/**
 * Figma map «شريط الفلاتر» (71:1370): bg/canvas, 28×14, 10 gap; the filter pills (city, type,
 * price, land class, document) at the start and, at the end, the brand/subtle button. Each pill
 * opens the same filters sheet as the search page (the pill dropdowns are not drawn in Figma).
 * «ارسم منطقة بحث» has no API, so the end button is «عرض كقائمة» (the same search as a list).
 *
 * @param {{
 *   filters: import('../../properties/searchFilters.js').SearchFilters,
 *   onOpenFilters: () => void,
 * }} props
 */
export function MapFiltersBar({ filters, onOpenFilters }) {
  let priceValues = [];
  if (filters.minPrice || filters.maxPrice) {
    priceValues = [formatPriceRange(filters.minPrice, filters.maxPrice)];
  }

  const pills = [
    { key: 'city', title: searchText.city, values: filters.city },
    {
      key: 'propertyType',
      title: searchText.propertyType,
      values: filters.propertyType.map((type) => PROPERTY_TYPE_LABELS[type]),
    },
    { key: 'price', title: text.price, values: priceValues },
    {
      key: 'landClassification',
      title: searchText.landClassification,
      values: filters.landClassification.map((landClass) => LAND_CLASSIFICATION_LABELS[landClass]),
    },
    {
      key: 'legalStatus',
      title: searchText.legalStatus,
      values: filters.legalStatus.map((legalStatus) => LEGAL_STATUS_LABELS[legalStatus]),
    },
  ];

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto border-b border-border bg-bg px-4 py-3 xl:px-7 xl:py-[14px]">
      {pills.map((pill) => {
        const label = pillLabel(pill.title, pill.values);
        return (
          <button
            key={pill.key}
            type="button"
            onClick={onOpenFilters}
            aria-label={text.openFilters(label)}
            className={pillClasses}
          >
            {label}
            <IconSort className="text-muted" />
          </button>
        );
      })}
      <span className="flex-1" />
      <Link
        to={searchPath({ ...filters, page: 1 })}
        className="shrink-0 rounded-md bg-brand-subtle px-[14px] py-[9px] text-[13.5px] leading-[1.7] font-semibold whitespace-nowrap text-brand-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {text.showList}
      </Link>
    </div>
  );
}
