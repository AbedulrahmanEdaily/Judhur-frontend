import { useState } from 'react';
import clsx from 'clsx';
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
 * Each list is single-choice because the API takes one value per filter.
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

  function choose(field, value, checked) {
    let next = '';
    if (checked) next = value;
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

  function handleClearAll() {
    onApply({ ...EMPTY_FILTERS, sort: filters.sort });
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
        <div className="flex rounded-md bg-inset">
          {LISTING_STATUSES.map((status) => {
            const isSelected = draft.propertyStatus === status;
            return (
              <button
                key={status}
                type="button"
                aria-pressed={isSelected}
                onClick={() => choose('propertyStatus', status, !isSelected)}
                className={clsx(
                  'flex-1 rounded-[10px] py-[9px] text-center text-[13.5px] leading-[1.7] focus-visible:outline-2 focus-visible:outline-brand',
                  isSelected ? 'bg-raised font-semibold text-text' : 'text-text-secondary',
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
            checked={draft.propertyType === type}
            onChange={(checked) => choose('propertyType', type, checked)}
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
            checked={draft.landClassification === landClass}
            onChange={(checked) => choose('landClassification', landClass, checked)}
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
            checked={draft.legalStatus === legalStatus}
            onChange={(checked) => choose('legalStatus', legalStatus, checked)}
          />
        ))}
      </FilterSection>
      <div className="h-px bg-border" />

      <button
        type="button"
        onClick={handleApply}
        className="bg-brand py-3.5 text-center text-[14.5px] leading-[1.7] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-inverse"
      >
        {text.apply}
      </button>
    </div>
  );
}
