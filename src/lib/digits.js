// Arabic keyboards type Arabic-Indic (٠-٩) or Persian (۰-۹) digits; the API expects Latin ones.

/** @param {string} value */
export function toLatinDigits(value) {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}
