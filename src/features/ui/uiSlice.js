import { createSlice } from '@reduxjs/toolkit';
import { getItem } from '../../lib/storage.js';

export const THEME_STORAGE_KEY = 'judhur.theme';

/** @typedef {'light'|'dark'} Theme */
/** @typedef {{ tone: import('../../components/ui/Toast.jsx').ToastTone, message: string }} Notice */

/** Saved preference first, else the OS preference (same rule as the pre-paint script in index.html). */
function readInitialTheme() {
  const saved = getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return { theme: saved, themeIsExplicit: true };
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return { theme: prefersDark ? 'dark' : 'light', themeIsExplicit: false };
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: () => ({
    ...readInitialTheme(),
    notices: /** @type {Notice[]} */ ([]),
    // The real-time hub (the project guide 6.17): while connected, nothing needs polling.
    isRealtimeConnected: false,
    rateLimitedUntil: /** @type {number | null} */ (null),
  }),
  reducers: {
    themeToggled(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      state.themeIsExplicit = true;
    },
    /** @param {{ payload: Theme }} action */
    themeChosenElsewhere(state, action) {
      state.theme = action.payload;
      state.themeIsExplicit = true;
    },
    /** @param {{ payload: Theme }} action */
    systemThemeChanged(state, action) {
      if (!state.themeIsExplicit) state.theme = action.payload;
    },
    /** A toast raised from outside React (e.g. by a listener); shown by `<NoticeToasts>`. */
    noticeShown(state, action) {
      state.notices.push(action.payload);
    },
    /** @param {{ payload: number }} action */
    noticesShown(state, action) {
      state.notices.splice(0, action.payload);
    },
    /** @param {{ payload: boolean }} action */
    realtimeConnectionChanged(state, action) {
      state.isRealtimeConnected = action.payload;
    },
    /** @param {{ payload: number }} action */
    rateLimitStarted(state, action) {
      state.rateLimitedUntil = action.payload;
    },
    rateLimitEnded(state) {
      state.rateLimitedUntil = null;
    },
  },
});

export const {
  themeToggled,
  themeChosenElsewhere,
  systemThemeChanged,
  noticeShown,
  noticesShown,
  realtimeConnectionChanged,
  rateLimitStarted,
  rateLimitEnded,
} = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

/** @param {{ ui: { theme: Theme } }} state */
export const selectTheme = (state) => state.ui.theme;
/** @param {{ ui: { themeIsExplicit: boolean } }} state */
export const selectThemeIsExplicit = (state) => state.ui.themeIsExplicit;
/** @param {{ ui: { notices: Notice[] } }} state */
export const selectNotices = (state) => state.ui.notices;
/** @param {{ ui: { isRealtimeConnected: boolean } }} state */
export const selectIsRealtimeConnected = (state) => state.ui.isRealtimeConnected;
/** @param {{ ui: { rateLimitedUntil: number | null } }} state */
export const selectRateLimitedUntil = (state) => state.ui.rateLimitedUntil;
/** @param {{ ui: { rateLimitedUntil: number | null } }} state */
export const selectIsRateLimited = (state) => state.ui.rateLimitedUntil !== null;
