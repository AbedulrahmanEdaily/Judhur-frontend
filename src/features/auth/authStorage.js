import { getJson, removeItem, setJson } from '../../lib/storage.js';

// Both tokens are kept: refreshing needs the refresh token *and* the expired access token.
export const AUTH_STORAGE_KEY = 'judhur.auth';

/**
 * @returns {import('../../api/types.js').TokenResponse | null}
 */
export function loadStoredTokens() {
  const stored = getJson(AUTH_STORAGE_KEY);
  if (
    !stored ||
    typeof stored.accessToken !== 'string' ||
    typeof stored.refreshToken !== 'string'
  ) {
    return null;
  }
  return {
    accessToken: stored.accessToken,
    refreshToken: stored.refreshToken,
    expiresOnUtc: typeof stored.expiresOnUtc === 'string' ? stored.expiresOnUtc : null,
  };
}

/** @param {{ accessToken: string, refreshToken: string, expiresOnUtc: string | null }} tokens */
export function storeTokens({ accessToken, refreshToken, expiresOnUtc }) {
  setJson(AUTH_STORAGE_KEY, { accessToken, refreshToken, expiresOnUtc });
}

export function clearStoredTokens() {
  removeItem(AUTH_STORAGE_KEY);
}
