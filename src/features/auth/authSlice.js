import { createSlice } from '@reduxjs/toolkit';
import { userFromAccessToken } from './jwt.js';

/**
 * @typedef {Object} AuthState
 * @property {string | null} accessToken
 * @property {string | null} refreshToken
 * @property {string | null} expiresOnUtc
 * @property {import('./jwt.js').SessionUser | null} user
 * @property {'anonymous'|'authenticated'} status
 */

/** @typedef {'logout'|'expired'} SessionEndReason */

/** @type {AuthState} */
export const anonymousState = {
  accessToken: null,
  refreshToken: null,
  expiresOnUtc: null,
  user: null,
  status: 'anonymous',
};

/**
 * Builds the session from a TokenResponse; anonymous if the token can't be read.
 * @param {import('../../api/types.js').TokenResponse} tokens
 * @returns {AuthState}
 */
export function sessionFromTokens({ accessToken, refreshToken, expiresOnUtc }) {
  const user = accessToken ? userFromAccessToken(accessToken) : null;
  if (!user || !refreshToken) return anonymousState;
  return {
    accessToken,
    refreshToken,
    expiresOnUtc: expiresOnUtc ?? null,
    user,
    status: 'authenticated',
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: anonymousState,
  reducers: {
    /** @param {{ payload: import('../../api/types.js').TokenResponse }} action */
    sessionStarted: (_state, action) => sessionFromTokens(action.payload),
    /** @param {{ payload: import('../../api/types.js').TokenResponse }} action */
    sessionRefreshed: (_state, action) => sessionFromTokens(action.payload),
    sessionEnded: {
      reducer: () => anonymousState,
      /** @param {SessionEndReason} [reason] */
      prepare: (reason = 'logout') => ({ payload: reason }),
    },
  },
});

export const { sessionStarted, sessionRefreshed, sessionEnded } = authSlice.actions;
export const authReducer = authSlice.reducer;

/** @param {{ auth: AuthState }} state */
export const selectAuth = (state) => state.auth;
/** @param {{ auth: AuthState }} state */
export const selectIsAuthenticated = (state) => state.auth.status === 'authenticated';
/** @param {{ auth: AuthState }} state */
export const selectCurrentUser = (state) => state.auth.user;
/** @param {{ auth: AuthState }} state */
export const selectIsAdmin = (state) => state.auth.user?.roles.includes('Admin') ?? false;
