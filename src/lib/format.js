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

/** The symbol of DEFAULT_CURRENCY ("₪"), for inputs that show it next to the value. */
export const CURRENCY_SYMBOL = priceFormatter
  .formatToParts(0)
  .find((part) => part.type === 'currency').value;

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' });

/**
 * "45,000 ₪". The right-to-left mark Intl adds for Arabic is dropped: prices are laid out left
 * to right, as in Figma.
 * @param {number} value
 */
export function formatPrice(value) {
  return priceFormatter.format(value).replace(/\u200f/g, '');
}

/** @param {number} value plain number with Latin digits → "1,204" */
export function formatNumber(value) {
  return numberFormatter.format(value);
}

/** @param {number} value area in square meters → "120 م²" */
export function formatArea(value) {
  return `${numberFormatter.format(value)} م²`;
}

/** @param {string | Date} value ISO-8601 string or Date */
export function formatDate(value) {
  return dateFormatter.format(typeof value === 'string' ? new Date(value) : value);
}
