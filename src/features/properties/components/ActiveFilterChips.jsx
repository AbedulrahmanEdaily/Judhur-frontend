import { IconChipClose } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import {
  LAND_CLASSIFICATION_LABELS,
  LEGAL_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from '../constants.js';
import { formatPriceRange } from '../searchFilters.js';

const text = ar.search;

/**
 * The chips for the filters that are set, in the Figma order (RTL). The purpose, city and
 * payment chips are not in Figma (it shows the purpose only in the panel's switch); the purpose
 * chip makes the filter visible on mobile, where the panel is in the drawer.
 */
function activeChips(filters) {
  const chips = [];
  if (filters.propertyStatus) {
    chips.push({ key: 'propertyStatus', label: PROPERTY_STATUS_LABELS[filters.propertyStatus] });
  }
  if (filters.searchTerm) {
    chips.push({ key: 'searchTerm', label: text.searchTermChip(filters.searchTerm) });
  }
  for (const type of filters.propertyType) {
    chips.push({ key: 'propertyType', value: type, label: PROPERTY_TYPE_LABELS[type] });
  }
  for (const city of filters.city) {
    chips.push({ key: 'city', value: city, label: city });
  }
  if (filters.minPrice || filters.maxPrice) {
    chips.push({ key: 'price', label: formatPriceRange(filters.minPrice, filters.maxPrice) });
  }
  for (const paymentType of filters.paymentType) {
    chips.push({ key: 'paymentType', value: paymentType, label: PAYMENT_TYPE_LABELS[paymentType] });
  }
  for (const landClass of filters.landClassification) {
    chips.push({
      key: 'landClassification',
      value: landClass,
      label: LAND_CLASSIFICATION_LABELS[landClass],
    });
  }
  for (const legalStatus of filters.legalStatus) {
    chips.push({ key: 'legalStatus', value: legalStatus, label: LEGAL_STATUS_LABELS[legalStatus] });
  }
  return chips;
}

/**
 * Figma "فلاتر مفعّلة" (53:865): «مفعّل:» then one brand/subtle chip per active filter with a
 * 12px close icon at the end — one chip per ticked value. Clicking a chip removes that value.
 *
 * @param {{
 *   filters: import('../searchFilters.js').SearchFilters,
 *   onRemove: (key: string, value?: string) => void,
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
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={() => onRemove(chip.key, chip.value)}
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
