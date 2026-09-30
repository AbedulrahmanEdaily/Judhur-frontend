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
 * Session side effects: persist tokens, and reset every cached response when a session starts
 * or ends. Nothing from the previous user survives, and public responses that differ for guests
 * and signed-in users (the seller phone on details) are fetched again.
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
    actionCreator: sessionStarted,
    effect: (_action, { dispatch }) => {
      dispatch(baseApi.util.resetApiState());
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
    if (next.user?.id !== current.user?.id) {
      // Someone signed in elsewhere (from a guest tab, or as another account): refetch everything.
      store.dispatch(baseApi.util.resetApiState());
    }
    store.dispatch(sessionRefreshed(stored));
  });
}
