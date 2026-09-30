import { useState } from 'react';
import clsx from 'clsx';
import { IconToastUndo } from '../../../components/icons/index.js';
import { toLatinDigits } from '../../../lib/digits.js';
import { formatNumber } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import {
  LAND_CLASSIFICATION_LABELS,
  LAND_CLASSIFICATIONS,
  LEGAL_STATUS_LABELS,
  LEGAL_STATUSES,
  LISTING_STATUSES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
} from '../constants.js';
import { EMPTY_FILTERS, toSearchParams } from '../searchFilters.js';
import { FilterOption } from './FilterOption.jsx';
import { FilterSection } from './FilterSection.jsx';
import { PriceInput } from './PriceInput.jsx';

const text = ar.search;

const landDotClasses = { A: 'bg-land-a', B: 'bg-land-b', C: 'bg-land-c' };

/** A typed price → a positive number, or null. */
function parsePrice(value) {
  const number = Number(toLatinDigits(value).replace(/[,\s]/g, ''));
  if (Number.isFinite(number) && number > 0) return number;
  return null;
}

/** The staged (not yet applied) choices, taken from the applied filters. */
function draftFrom(filters) {
  return {
    propertyStatus: filters.propertyStatus,
    propertyType: filters.propertyType,
    minPrice: filters.minPrice ? formatNumber(filters.minPrice) : '',
    maxPrice: filters.maxPrice ? formatNumber(filters.maxPrice) : '',
    landClassification: filters.landClassification,
    legalStatus: filters.legalStatus,
  };
}

/**
 * Figma "الفلاتر" (52:865). Choices are staged here and reach the URL only on «طبّق الفلاتر».
 * The purpose is one choice; the checkbox lists take several (BACKEND_REQUESTS #16).
 *
 * @param {{
 *   filters: import('../searchFilters.js').SearchFilters,
 *   onApply: (filters: import('../searchFilters.js').SearchFilters) => void,
 *   className?: string,
 * }} props
 */
export function SearchFiltersPanel({ filters, onApply, className }) {
  const appliedKey = toSearchParams(filters).toString();
  const [draft, setDraft] = useState(() => draftFrom(filters));
  const [draftKey, setDraftKey] = useState(appliedKey);

  // A chip removed or the URL changed: start again from the applied filters.
  if (draftKey !== appliedKey) {
    setDraftKey(appliedKey);
    setDraft(draftFrom(filters));
  }

  function choosePurpose(status) {
    let next = status;
    if (draft.propertyStatus === status) next = '';
    setDraft({ ...draft, propertyStatus: next });
  }

  // Tick adds the value to the list, untick takes it out.
  function toggle(field, value, checked) {
    let next = draft[field].filter((item) => item !== value);
    if (checked) next = [...next, value];
    setDraft({ ...draft, [field]: next });
  }

  function handleApply() {
    onApply({
      ...filters,
      propertyStatus: draft.propertyStatus,
      propertyType: draft.propertyType,
      minPrice: parsePrice(draft.minPrice),
      maxPrice: parsePrice(draft.maxPrice),
      landClassification: draft.landClassification,
      legalStatus: draft.legalStatus,
      page: 1,
    });
  }

  // «مسح الكل» clears the filters and keeps the sort. The draft is cleared here too, because
  // the URL may already be empty and then the draftKey check above would not run.
  function handleClearAll() {
    setDraft(draftFrom(EMPTY_FILTERS));
    onApply({ ...EMPTY_FILTERS, sort: filters.sort });
  }

  // «إعادة الضبط» puts everything back to the defaults: filters, text search and sort.
  function handleReset() {
    setDraft(draftFrom(EMPTY_FILTERS));
    onApply(EMPTY_FILTERS);
  }

  return (
    <div
      className={clsx(
        'flex flex-col overflow-hidden rounded-lg border border-border bg-raised',
        className,
      )}
    >
      <div className="flex items-center bg-surface px-5 py-[18px]">
        <h2 className="flex-1 text-[16px] leading-[1.7] font-bold text-text">{text.filters}</h2>
        <button
          type="button"
          onClick={handleClearAll}
          className="rounded-sm text-[12.5px] leading-[1.7] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
        >
          {text.clearAll}
        </button>
      </div>

      <FilterSection title={text.purpose}>
        <div className="flex gap-1 rounded-md bg-inset p-1">
          {LISTING_STATUSES.map((status) => {
            const isSelected = draft.propertyStatus === status;
            return (
              <button
                key={status}
                type="button"
                aria-pressed={isSelected}
                onClick={() => choosePurpose(status)}
                className={clsx(
                  'flex-1 rounded-sm py-[5px] text-center text-[13.5px] leading-[1.7] transition-colors focus-visible:outline-2 focus-visible:outline-brand',
                  isSelected && 'bg-raised font-semibold text-brand-text shadow-segment',
                  !isSelected && 'text-text-secondary hover:text-text',
                )}
              >
                {PROPERTY_STATUS_LABELS[status]}
              </button>
            );
          })}
        </div>
      </FilterSection>
      <div className="h-px bg-border" />

      <FilterSection title={text.propertyType}>
        {PROPERTY_TYPES.map((type) => (
          <FilterOption
            key={type}
            label={PROPERTY_TYPE_LABELS[type]}
            checked={draft.propertyType.includes(type)}
            onChange={(checked) => toggle('propertyType', type, checked)}
          />
        ))}
      </FilterSection>
      <div className="h-px bg-border" />

      <FilterSection title={text.priceRange}>
        <div className="flex gap-2.5">
          <PriceInput
            label={text.from}
            value={draft.minPrice}
            onChange={(value) => setDraft({ ...draft, minPrice: value })}
          />
          <PriceInput
            label={text.to}
            value={draft.maxPrice}
            onChange={(value) => setDraft({ ...draft, maxPrice: value })}
          />
        </div>
      </FilterSection>
      <div className="h-px bg-border" />

      <FilterSection title={text.landClassification}>
        {LAND_CLASSIFICATIONS.map((landClass) => (
          <FilterOption
            key={landClass}
            label={LAND_CLASSIFICATION_LABELS[landClass]}
            checked={draft.landClassification.includes(landClass)}
            onChange={(checked) => toggle('landClassification', landClass, checked)}
            dotClassName={landDotClasses[landClass]}
          />
        ))}
      </FilterSection>
      <div className="h-px bg-border" />

      <FilterSection title={text.legalStatus}>
        {LEGAL_STATUSES.map((legalStatus) => (
          <FilterOption
            key={legalStatus}
            label={LEGAL_STATUS_LABELS[legalStatus]}
            checked={draft.legalStatus.includes(legalStatus)}
            onChange={(checked) => toggle('legalStatus', legalStatus, checked)}
          />
        ))}
      </FilterSection>
      <div className="h-px bg-border" />

      <div className="flex">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 border-e border-border bg-surface px-5 py-3.5 text-[14px] leading-[1.7] font-semibold text-text-secondary transition-colors hover:bg-inset hover:text-text focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand"
        >
          <IconToastUndo />
          {text.reset}
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 bg-brand py-3.5 text-center text-[14.5px] leading-[1.7] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-inverse"
        >
          {text.apply}
        </button>
      </div>
    </div>
  );
}
