import { formatNumber, formatPrice } from '../../lib/format.js';
import { ar } from '../../locales/ar.js';
import {
  CITIES,
  DEFAULT_SORT,
  LAND_CLASSIFICATIONS,
  LEGAL_STATUSES,
  LISTING_STATUSES,
  MAX_SEARCH_CITIES,
  PAYMENT_TYPES,
  PROPERTY_TYPES,
  SEARCH_PAGE_SIZE,
  SORT_OPTIONS,
} from './constants.js';

// The search state lives in the URL (the project guide section 11) with the same names the API uses.

/**
 * @typedef {Object} SearchFilters
 * @property {string} searchTerm
 * @property {string[]} city any of these
 * @property {number | null} minPrice
 * @property {number | null} maxPrice
 * @property {string[]} propertyType any of these
 * @property {string} propertyStatus one choice
 * @property {string[]} paymentType any of these
 * @property {string[]} landClassification any of these
 * @property {string[]} legalStatus any of these
 * @property {string} sort "<sortColumn>-<sortDirection>"
 * @property {number} page
 */

/** @type {SearchFilters} */
export const EMPTY_FILTERS = {
  searchTerm: '',
  city: [],
  minPrice: null,
  maxPrice: null,
  propertyType: [],
  propertyStatus: '',
  paymentType: [],
  landClassification: [],
  legalStatus: [],
  sort: DEFAULT_SORT,
  page: 1,
};

/** A value from the URL, only if it is one of `allowed`. */
function pickAllowed(value, allowed) {
  if (value && allowed.includes(value)) return value;
  return '';
}

/** The values from the URL that are in `allowed`, once each, in the `allowed` order. */
function pickAllowedList(values, allowed) {
  return allowed.filter((value) => values.includes(value));
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
    city: pickAllowedList(searchParams.getAll('city'), CITIES).slice(0, MAX_SEARCH_CITIES),
    minPrice: readPositiveNumber(searchParams.get('minPrice')),
    maxPrice: readPositiveNumber(searchParams.get('maxPrice')),
    propertyType: pickAllowedList(searchParams.getAll('propertyType'), PROPERTY_TYPES),
    propertyStatus: pickAllowed(searchParams.get('propertyStatus'), LISTING_STATUSES),
    paymentType: pickAllowedList(searchParams.getAll('paymentType'), PAYMENT_TYPES),
    landClassification: pickAllowedList(
      searchParams.getAll('landClassification'),
      LAND_CLASSIFICATIONS,
    ),
    legalStatus: pickAllowedList(searchParams.getAll('legalStatus'), LEGAL_STATUSES),
    sort,
    page,
  };
}

/**
 * Filters → the URL query (and the API query, minus paging). Empty values and the defaults
 * are left out. A list filter repeats its name once per value: `city=نابلس&city=جنين`.
 * @param {SearchFilters} filters
 */
export function toSearchParams(filters) {
  const params = new URLSearchParams();
  if (filters.searchTerm) params.set('searchTerm', filters.searchTerm);
  for (const city of filters.city) params.append('city', city);
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  for (const type of filters.propertyType) params.append('propertyType', type);
  if (filters.propertyStatus) params.set('propertyStatus', filters.propertyStatus);
  for (const paymentType of filters.paymentType) params.append('paymentType', paymentType);
  for (const landClass of filters.landClassification) {
    params.append('landClassification', landClass);
  }
  for (const legalStatus of filters.legalStatus) params.append('legalStatus', legalStatus);
  if (filters.sort !== DEFAULT_SORT) {
    const [sortColumn, sortDirection] = filters.sort.split('-');
    params.set('sortColumn', sortColumn);
    params.set('sortDirection', sortDirection);
  }
  if (filters.page > 1) params.set('page', String(filters.page));
  return params;
}

/**
 * Filters → the query string for `GET /User/Properties`. It is a string (not an object)
 * because RTK Query would join a list with commas instead of repeating the name.
 * @param {SearchFilters} filters
 */
export function toApiQuery(filters) {
  const params = toSearchParams(filters);
  const [sortColumn, sortDirection] = filters.sort.split('-');
  params.set('sortColumn', sortColumn);
  params.set('sortDirection', sortDirection);
  params.set('page', String(filters.page));
  params.set('pageSize', String(SEARCH_PAGE_SIZE));
  return params.toString();
}

/** `/properties?…` for a set of filters (used by links and the hero search). */
export function searchPath(filters) {
  const query = toSearchParams({ ...EMPTY_FILTERS, ...filters }).toString();
  if (!query) return '/properties';
  return `/properties?${query}`;
}

/**
 * How many filters are set (the mobile «فلاتر (4)» button); each ticked value counts once.
 * The text search, sort and page are not counted.
 * @param {SearchFilters} filters
 */
export function countActiveFilters(filters) {
  let count = 0;
  if (filters.minPrice || filters.maxPrice) count += 1;
  if (filters.propertyStatus) count += 1;
  count += filters.city.length;
  count += filters.propertyType.length;
  count += filters.paymentType.length;
  count += filters.landClassification.length;
  count += filters.legalStatus.length;
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
