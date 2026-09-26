import { isAnyOf } from '@reduxjs/toolkit';
import { baseApi } from '../../api/baseApi.js';
import { noticeShown } from '../ui/uiSlice.js';
import {
  selectAuth,
  sessionEnded,
  sessionFromTokens,
  sessionRefreshed,
  sessionStarted,
} from './authSlice.js';
import {
  AUTH_STORAGE_KEY,
  clearStoredTokens,
  isSessionOnly,
  loadStoredTokens,
  storeTokens,
} from './authStorage.js';
import { ar } from '../../locales/ar.js';

/**
 * Session side effects: persist tokens, and on session end clear storage and every cached
 * response so nothing from the previous user survives.
 *
 * @param {import('@reduxjs/toolkit').ListenerMiddlewareInstance['startListening']} startListening
 */
export function registerAuthListeners(startListening) {
  startListening({
    matcher: isAnyOf(sessionStarted, sessionRefreshed),
    effect: (_action, { getState, dispatch }) => {
      const auth = selectAuth(/** @type {any} */ (getState()));
      if (auth.status === 'authenticated') storeTokens(auth);
      else dispatch(sessionEnded('expired')); // the tokens could not be read
    },
  });

  startListening({
    actionCreator: sessionEnded,
    effect: (action, { dispatch }) => {
      clearStoredTokens();
      dispatch(baseApi.util.resetApiState());
      if (action.payload === 'expired') {
        dispatch(noticeShown({ tone: 'warning', message: ar.auth.sessionExpired }));
      }
    },
  });
}

/**
 * Keeps other open tabs in step: a login, refresh, or logout in one tab updates the rest.
 * Without this, a tab holding an old refresh token would fail its next refresh and log out.
 *
 * @param {{ getState: () => any, dispatch: (action: any) => any }} store
 */
export function syncSessionAcrossTabs(store) {
  window.addEventListener('storage', (event) => {
    if (event.key !== null && event.key !== AUTH_STORAGE_KEY) return;
    // A session started without "تذكّرني" belongs to this tab only.
    if (isSessionOnly()) return;

    const current = selectAuth(store.getState());
    const stored = loadStoredTokens();

    if (!stored) {
      if (current.status === 'authenticated') store.dispatch(sessionEnded('logout'));
      return;
    }
    if (stored.refreshToken === current.refreshToken) return;

    const next = sessionFromTokens(stored);
    if (current.user && next.user?.id !== current.user.id) {
      // A different account signed in elsewhere: drop this user's cached data first.
      store.dispatch(baseApi.util.resetApiState());
    }
    store.dispatch(sessionRefreshed(stored));
  });
}
