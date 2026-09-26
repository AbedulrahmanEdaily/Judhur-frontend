import { createSlice } from '@reduxjs/toolkit';
import { getItem } from '../../lib/storage.js';

export const THEME_STORAGE_KEY = 'judhur.theme';

/** @typedef {'light'|'dark'} Theme */

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
  initialState: () => readInitialTheme(),
  reducers: {
    themeToggled(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      state.themeIsExplicit = true;
    },
  },
});

export const { themeToggled } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

/** @param {{ ui: { theme: Theme } }} state */
export const selectTheme = (state) => state.ui.theme;
/** @param {{ ui: { themeIsExplicit: boolean } }} state */
export const selectThemeIsExplicit = (state) => state.ui.themeIsExplicit;
