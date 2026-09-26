import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun } from 'lucide-react';
import { selectTheme, themeToggled } from '../../features/ui/uiSlice.js';
import { ar } from '../../locales/ar.js';

export function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';
  const label = isDark ? ar.theme.toLight : ar.theme.toDark;

  return (
    <button
      type="button"
      onClick={() => dispatch(themeToggled())}
      aria-label={label}
      title={label}
      className="rounded-md bg-inset p-[9px] text-text transition-colors hover:text-brand-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
