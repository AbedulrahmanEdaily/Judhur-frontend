import { IconChipClose } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import {
  LAND_CLASSIFICATION_LABELS,
  LEGAL_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from '../constants.js';
import { formatPriceRange } from '../searchFilters.js';

const text = ar.search;

/**
 * The chips for the filters that are set, in the Figma order (RTL). The purpose has no chip —
 * Figma shows it only in the panel's switch.
 */
function activeChips(filters) {
  const chips = [];
  if (filters.searchTerm) {
    chips.push({ key: 'searchTerm', label: text.searchTermChip(filters.searchTerm) });
  }
  if (filters.propertyType) {
    chips.push({ key: 'propertyType', label: PROPERTY_TYPE_LABELS[filters.propertyType] });
  }
  if (filters.city) chips.push({ key: 'city', label: filters.city });
  if (filters.minPrice || filters.maxPrice) {
    chips.push({ key: 'price', label: formatPriceRange(filters.minPrice, filters.maxPrice) });
  }
  if (filters.landClassification) {
    chips.push({
      key: 'landClassification',
      label: LAND_CLASSIFICATION_LABELS[filters.landClassification],
    });
  }
  if (filters.legalStatus) {
    chips.push({ key: 'legalStatus', label: LEGAL_STATUS_LABELS[filters.legalStatus] });
  }
  return chips;
}

/**
 * Figma "فلاتر مفعّلة" (53:865): «مفعّل:» then one brand/subtle chip per active filter with a
 * 12px close icon at the end. Clicking a chip removes that filter.
 *
 * @param {{
 *   filters: import('../searchFilters.js').SearchFilters,
 *   onRemove: (key: string) => void,
 * }} props
 */
export function ActiveFilterChips({ filters, onRemove }) {
  const chips = activeChips(filters);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[12.5px] leading-[1.7] text-muted">{text.active}</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          aria-label={text.removeFilter(chip.label)}
          className="flex items-center gap-[7px] rounded-full bg-brand-subtle py-1.5 ps-3 pe-2.5 text-[12.5px] leading-[1.7] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
        >
          <span dir="auto">{chip.label}</span>
          <IconChipClose />
        </button>
      ))}
    </div>
  );
}
