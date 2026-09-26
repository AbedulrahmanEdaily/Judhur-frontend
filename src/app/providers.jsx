import { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store } from './store.js';
import { selectTheme, selectThemeIsExplicit, THEME_STORAGE_KEY } from '../features/ui/uiSlice.js';
import { setItem } from '../lib/storage.js';
import { ToastProvider } from '../components/ui/ToastProvider.jsx';

/** Keeps `<html class="dark">` in sync with the ui slice. Only a user choice is persisted. */
function ThemeSync() {
  const theme = useSelector(selectTheme);
  const isExplicit = useSelector(selectThemeIsExplicit);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    if (isExplicit) setItem(THEME_STORAGE_KEY, theme);
  }, [theme, isExplicit]);

  return null;
}

/** @param {{ children: import('react').ReactNode }} props */
export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <ThemeSync />
      <ToastProvider>{children}</ToastProvider>
    </Provider>
  );
}
