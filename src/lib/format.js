// Number/date formatting with Latin digits inside Arabic text.

const LOCALE = 'ar-u-nu-latn';

/** Currency is not in the API yet (BACKEND_REQUESTS.md #9) — change it here only. */
export const DEFAULT_CURRENCY = 'ILS';

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: DEFAULT_CURRENCY,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 });

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' });

/** @param {number} value */
export function formatPrice(value) {
  return priceFormatter.format(value);
}

/** @param {number} value area in square meters → "120 م²" */
export function formatArea(value) {
  return `${numberFormatter.format(value)} م²`;
}

/** @param {string | Date} value ISO-8601 string or Date */
export function formatDate(value) {
  return dateFormatter.format(typeof value === 'string' ? new Date(value) : value);
}
