import { Mutex } from 'async-mutex';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config/env.js';
import { selectAuth, sessionEnded, sessionRefreshed } from '../features/auth/authSlice.js';
import { loadStoredTokens } from '../features/auth/authStorage.js';

export const ACCOUNT_PATH = '/api/Identity/Account';
export const USER_PROPERTIES_PATH = '/api/v1/User/Properties';
export const FAVORITES_PATH = '/api/v1/User/Favorites';
export const ADMIN_PROPERTIES_PATH = '/api/v1/Admin/Properties';
export const NOTIFICATIONS_PATH = '/api/v1/User/Notifications';

const REFRESH_URL = `${ACCOUNT_PATH}/refresh-token`;

/** Requests that never trigger a refresh-and-retry. */
const NO_REAUTH_URLS = ['/login', '/logout', '/refresh-token'].map((path) =>
  `${ACCOUNT_PATH}${path}`.toLowerCase(),
);

/** Refresh ahead of time when the access token has less than this left. */
const REFRESH_AHEAD_MS = 60_000;

// The server keeps exactly one refresh token per user and deletes it on every refresh,
// so two parallel refreshes would log the user out. Only one may run at a time.
const refreshMutex = new Mutex();

// Bumped after every refresh attempt, so requests that queued behind an attempt don't repeat
// it (e.g. while offline, where the attempt fails but the session is kept).
let refreshAttempts = 0;

const publicQuery = fetchBaseQuery({ baseUrl: API_BASE_URL });

const authorizedQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const { accessToken } = selectAuth(/** @type {any} */ (getState()));
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    return headers;
  },
});

/** @param {string | import('@reduxjs/toolkit/query').FetchArgs} args */
function isExempt(args) {
  const url = (typeof args === 'string' ? args : args.url).toLowerCase();
  return NO_REAUTH_URLS.some((path) => url.startsWith(path));
}

/** @param {string | null} expiresOnUtc */
function expiresSoon(expiresOnUtc) {
  const expiresAt = expiresOnUtc ? Date.parse(expiresOnUtc) : NaN;
  return Number.isFinite(expiresAt) && expiresAt - Date.now() < REFRESH_AHEAD_MS;
}

/**
 * True when the server rejected the session (401 expired/replaced, 404 user gone, …).
 * Network trouble, 5xx, and 429 keep the session: the refresh token is still valid.
 */
function isSessionRejected(error) {
  return (
    typeof error?.status === 'number' &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 429
  );
}

/** Tokens another tab stored after rotating the session, if they differ from ours. */
function newerTokensFromOtherTab(refreshToken) {
  const stored = loadStoredTokens();
  return stored && stored.refreshToken !== refreshToken ? stored : null;
}

/** POST /refresh-token and update the session. Must run while holding `refreshMutex`. */
async function refreshSession(api, extraOptions) {
  const { accessToken, refreshToken } = selectAuth(api.getState());
  if (!accessToken || !refreshToken) return;

  const adopted = newerTokensFromOtherTab(refreshToken);
  if (adopted) {
    api.dispatch(sessionRefreshed(adopted));
    return;
  }

  const result = await publicQuery(
    { url: REFRESH_URL, method: 'POST', body: { refreshToken, expiredAccessToken: accessToken } },
    api,
    extraOptions,
  );

  if (result.data) {
    api.dispatch(sessionRefreshed(/** @type {any} */ (result.data)));
  } else if (isSessionRejected(result.error)) {
    // Another tab may have won the rotation while this request was in flight.
    const latest = newerTokensFromOtherTab(refreshToken);
    api.dispatch(latest ? sessionRefreshed(latest) : sessionEnded('expired'));
  }
}

/**
 * Refreshes unless, while this request waited for the lock, another request already replaced
 * `staleToken` or already tried and failed.
 */
async function refreshUnlessReplaced(api, extraOptions, staleToken) {
  const attemptsSeen = refreshAttempts;
  const release = await refreshMutex.acquire();
  try {
    const tokenUnchanged = selectAuth(api.getState()).accessToken === staleToken;
    if (tokenUnchanged && refreshAttempts === attemptsSeen) {
      await refreshSession(api, extraOptions);
      refreshAttempts += 1;
    }
  } finally {
    release();
  }
}

/**
 * fetchBaseQuery + Bearer token + one refresh-and-retry on 401.
 * @type {import('@reduxjs/toolkit/query').BaseQueryFn}
 */
export async function baseQueryWithReauth(args, api, extraOptions) {
  // Don't send a token that is being replaced right now.
  await refreshMutex.waitForUnlock();

  const exempt = isExempt(args);
  if (!exempt) {
    const { accessToken, expiresOnUtc } = selectAuth(api.getState());
    if (accessToken && expiresSoon(expiresOnUtc)) {
      await refreshUnlessReplaced(api, extraOptions, accessToken);
    }
  }

  const tokenUsed = selectAuth(api.getState()).accessToken;
  const result = await authorizedQuery(args, api, extraOptions);
  if (exempt || !tokenUsed || result.error?.status !== 401) return result;

  await refreshUnlessReplaced(api, extraOptions, tokenUsed);

  const currentToken = selectAuth(api.getState()).accessToken;
  if (!currentToken || currentToken === tokenUsed) return result; // session ended or not renewed

  // Retry the original request once — never loop.
  return authorizedQuery(args, api, extraOptions);
}
