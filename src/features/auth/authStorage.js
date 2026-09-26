import { getItem, removeItem, setItem } from '../../lib/storage.js';

// Both tokens are kept: refreshing needs the refresh token *and* the expired access token.
export const AUTH_STORAGE_KEY = 'judhur.auth';

// Set in sessionStorage when the user logs in without "تذكّرني": the session then lives in
// sessionStorage and ends when the browser closes.
const SESSION_ONLY_FLAG = 'judhur.auth.sessionOnly';

function readSessionStorage(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionStorage(key, value) {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; the session then just isn't kept.
  }
}

/** True when this tab's session was started without "تذكّرني". */
export function isSessionOnly() {
  return readSessionStorage(SESSION_ONLY_FLAG) === '1';
}

/** Called right before a new session starts. @param {boolean} remember */
export function setRememberSession(remember) {
  if (remember) writeSessionStorage(SESSION_ONLY_FLAG, null);
  else writeSessionStorage(SESSION_ONLY_FLAG, '1');
}

/** @returns {import('../../api/types.js').TokenResponse | null} */
export function loadStoredTokens() {
  let raw = getItem(AUTH_STORAGE_KEY);
  if (isSessionOnly()) raw = readSessionStorage(AUTH_STORAGE_KEY);
  if (!raw) return null;

  let stored;
  try {
    stored = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    !stored ||
    typeof stored.accessToken !== 'string' ||
    typeof stored.refreshToken !== 'string'
  ) {
    return null;
  }

  let expiresOnUtc = null;
  if (typeof stored.expiresOnUtc === 'string') expiresOnUtc = stored.expiresOnUtc;
  return { accessToken: stored.accessToken, refreshToken: stored.refreshToken, expiresOnUtc };
}

/** @param {{ accessToken: string, refreshToken: string, expiresOnUtc: string | null }} tokens */
export function storeTokens({ accessToken, refreshToken, expiresOnUtc }) {
  const json = JSON.stringify({ accessToken, refreshToken, expiresOnUtc });
  if (isSessionOnly()) {
    writeSessionStorage(AUTH_STORAGE_KEY, json);
    removeItem(AUTH_STORAGE_KEY);
  } else {
    setItem(AUTH_STORAGE_KEY, json);
  }
}

export function clearStoredTokens() {
  removeItem(AUTH_STORAGE_KEY);
  writeSessionStorage(AUTH_STORAGE_KEY, null);
  writeSessionStorage(SESSION_ONLY_FLAG, null);
}
