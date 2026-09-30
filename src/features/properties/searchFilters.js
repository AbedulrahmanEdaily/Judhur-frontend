import { formatNumber, formatPrice } from '../../lib/format.js';
import { ar } from '../../locales/ar.js';
import {
  DEFAULT_SORT,
  LAND_CLASSIFICATIONS,
  LEGAL_STATUSES,
  LISTING_STATUSES,
  PROPERTY_TYPES,
  SEARCH_PAGE_SIZE,
  SORT_OPTIONS,
} from './constants.js';

// The search state lives in the URL (CLAUDE.md section 11) with the same names the API uses.

/**
 * @typedef {Object} SearchFilters
 * @property {string} searchTerm
 * @property {string} city
 * @property {number | null} minPrice
 * @property {number | null} maxPrice
 * @property {string} propertyType
 * @property {string} propertyStatus
 * @property {string} landClassification
 * @property {string} legalStatus
 * @property {string} sort "<sortColumn>-<sortDirection>"
 * @property {number} page
 */

/** @type {SearchFilters} */
export const EMPTY_FILTERS = {
  searchTerm: '',
  city: '',
  minPrice: null,
  maxPrice: null,
  propertyType: '',
  propertyStatus: '',
  landClassification: '',
  legalStatus: '',
  sort: DEFAULT_SORT,
  page: 1,
};

/** A value from the URL, only if it is one of `allowed`. */
function pickAllowed(value, allowed) {
  if (value && allowed.includes(value)) return value;
  return '';
}

/** A positive number from the URL, else null. */
function readPositiveNumber(value) {
  const number = Number(value);
  if (value && Number.isFinite(number) && number > 0) return number;
  return null;
}

/**
 * URL → filters. Unknown or invalid values are dropped, so a hand-edited URL never
 * reaches the API.
 * @param {URLSearchParams} searchParams
 * @returns {SearchFilters}
 */
export function readSearchFilters(searchParams) {
  const sortValues = SORT_OPTIONS.map((option) => option.value);
  const sortFromUrl = `${searchParams.get('sortColumn')}-${searchParams.get('sortDirection')}`;

  let sort = DEFAULT_SORT;
  if (sortValues.includes(sortFromUrl)) sort = sortFromUrl;

  let page = Math.floor(Number(searchParams.get('page')));
  if (!Number.isFinite(page) || page < 1) page = 1;

  return {
    searchTerm: (searchParams.get('searchTerm') ?? '').trim(),
    city: (searchParams.get('city') ?? '').trim(),
    minPrice: readPositiveNumber(searchParams.get('minPrice')),
    maxPrice: readPositiveNumber(searchParams.get('maxPrice')),
    propertyType: pickAllowed(searchParams.get('propertyType'), PROPERTY_TYPES),
    propertyStatus: pickAllowed(searchParams.get('propertyStatus'), LISTING_STATUSES),
    landClassification: pickAllowed(searchParams.get('landClassification'), LAND_CLASSIFICATIONS),
    legalStatus: pickAllowed(searchParams.get('legalStatus'), LEGAL_STATUSES),
    sort,
    page,
  };
}

/**
 * Filters → the URL query (and the API query, minus paging). Empty values and the defaults
 * are left out.
 * @param {SearchFilters} filters
 */
export function toSearchParams(filters) {
  const params = new URLSearchParams();
  if (filters.searchTerm) params.set('searchTerm', filters.searchTerm);
  if (filters.city) params.set('city', filters.city);
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.propertyType) params.set('propertyType', filters.propertyType);
  if (filters.propertyStatus) params.set('propertyStatus', filters.propertyStatus);
  if (filters.landClassification) {
    params.set('landClassification', filters.landClassification);
  }
  if (filters.legalStatus) params.set('legalStatus', filters.legalStatus);
  if (filters.sort !== DEFAULT_SORT) {
    const [sortColumn, sortDirection] = filters.sort.split('-');
    params.set('sortColumn', sortColumn);
    params.set('sortDirection', sortDirection);
  }
  if (filters.page > 1) params.set('page', String(filters.page));
  return params;
}

/**
 * Filters → the plain object RTK Query sends as `GET /User/Properties` params.
 * @param {SearchFilters} filters
 */
export function toApiQuery(filters) {
  const query = Object.fromEntries(toSearchParams(filters));
  const [sortColumn, sortDirection] = filters.sort.split('-');
  query.sortColumn = sortColumn;
  query.sortDirection = sortDirection;
  query.page = String(filters.page);
  query.pageSize = String(SEARCH_PAGE_SIZE);
  return query;
}

/** `/properties?…` for a set of filters (used by links and the hero search). */
export function searchPath(filters) {
  const query = toSearchParams({ ...EMPTY_FILTERS, ...filters }).toString();
  if (!query) return '/properties';
  return `/properties?${query}`;
}

/**
 * How many filters are set (the mobile «فلاتر (4)» button). The text search, sort and page
 * are not counted.
 * @param {SearchFilters} filters
 */
export function countActiveFilters(filters) {
  let count = 0;
  if (filters.city) count += 1;
  if (filters.minPrice || filters.maxPrice) count += 1;
  if (filters.propertyType) count += 1;
  if (filters.propertyStatus) count += 1;
  if (filters.landClassification) count += 1;
  if (filters.legalStatus) count += 1;
  return count;
}

/**
 * "20,000 – 80,000 ₪", "من 20,000 ₪" or "حتى 80,000 ₪".
 * @param {number | null} minPrice
 * @param {number | null} maxPrice
 */
export function formatPriceRange(minPrice, maxPrice) {
  if (minPrice && maxPrice) return `${formatNumber(minPrice)} – ${formatPrice(maxPrice)}`;
  if (minPrice) return ar.search.priceFrom(formatPrice(minPrice));
  return ar.search.priceTo(formatPrice(maxPrice));
}
