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
  initialState: () => ({ ...readInitialTheme(), notice: /** @type {Notice | null} */ (null) }),
  reducers: {
    themeToggled(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      state.themeIsExplicit = true;
    },
    /** A toast raised from outside React (e.g. by a listener); shown by `<NoticeToasts>`. */
    noticeShown(state, action) {
      state.notice = action.payload;
    },
    noticeDismissed(state) {
      state.notice = null;
    },
  },
});

export const { themeToggled, noticeShown, noticeDismissed } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

/** @param {{ ui: { theme: Theme } }} state */
export const selectTheme = (state) => state.ui.theme;
/** @param {{ ui: { themeIsExplicit: boolean } }} state */
export const selectThemeIsExplicit = (state) => state.ui.themeIsExplicit;
/** @param {{ ui: { notice: Notice | null } }} state */
export const selectNotice = (state) => state.ui.notice;
