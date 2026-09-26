// Safe localStorage access: storage can be unavailable (private mode, blocked site data).

/**
 * @param {string} key
 * @returns {string | null}
 */
export function getItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 * @param {string} value
 */
export function setItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore — persistence is best effort.
  }
}

/** @param {string} key */
export function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore — persistence is best effort.
  }
}
