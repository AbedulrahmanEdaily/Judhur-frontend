import { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store.js';
import {
  noticesShown,
  selectNotices,
  selectTheme,
  selectThemeIsExplicit,
  systemThemeChanged,
  themeChosenElsewhere,
  THEME_STORAGE_KEY,
} from '../features/ui/uiSlice.js';
import { setItem } from '../lib/storage.js';
import { ToastProvider } from '../components/ui/ToastProvider.jsx';
import { RateLimitNotice } from '../components/ui/RateLimitNotice.jsx';
import { useToast } from '../components/ui/useToast.js';

/** Keeps `<html class="dark">` in sync with the ui slice. Only a user choice is persisted. */
function ThemeSync() {
  const theme = useSelector(selectTheme);
  const isExplicit = useSelector(selectThemeIsExplicit);
  const dispatch = useDispatch();

  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== THEME_STORAGE_KEY) return;
      if (event.newValue === 'light' || event.newValue === 'dark') {
        dispatch(themeChosenElsewhere(event.newValue));
      }
    }
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    function handleSystemChange(event) {
      dispatch(systemThemeChanged(event.matches ? 'dark' : 'light'));
    }
    window.addEventListener('storage', handleStorage);
    media?.addEventListener('change', handleSystemChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      media?.removeEventListener('change', handleSystemChange);
    };
  }, [dispatch]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    if (isExplicit) setItem(THEME_STORAGE_KEY, theme);
  }, [theme, isExplicit]);

  return null;
}

/** Shows notices raised outside React (e.g. "session expired") as toasts. */
function NoticeToasts() {
  const notices = useSelector(selectNotices);
  const dispatch = useDispatch();
  const toast = useToast();

  useEffect(() => {
    if (notices.length === 0) return;
    for (const notice of notices) toast.show(notice);
    dispatch(noticesShown(notices.length));
  }, [notices, toast, dispatch]);

  return null;
}

/** @param {{ children: import('react').ReactNode }} props */
export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <ThemeSync />
      <ToastProvider>
        <NoticeToasts />
        <RateLimitNotice />
        {children}
      </ToastProvider>
    </Provider>
  );
}
