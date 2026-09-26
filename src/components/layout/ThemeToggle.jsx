import { useDispatch, useSelector } from 'react-redux';
import { IconMoon } from '../icons/index.js';
import { selectTheme, themeToggled } from '../../features/ui/uiSlice.js';
import { ar } from '../../locales/ar.js';

/** Figma navbar "أيقونة": bg/inset, 9px padding, radius md, 18px moon in text/secondary. */
export function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  let label = ar.theme.toDark;
  if (theme === 'dark') label = ar.theme.toLight;

  return (
    <button
      type="button"
      onClick={() => dispatch(themeToggled())}
      aria-label={label}
      title={label}
      className="rounded-md bg-inset p-[9px] text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <IconMoon />
    </button>
  );
}
