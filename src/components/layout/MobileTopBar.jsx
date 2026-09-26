import { Link } from 'react-router';
import { Logo } from './Logo.jsx';
import { ar } from '../../locales/ar.js';

/**
 * Figma mobile "الشريط العلوي" (83:477): bg/canvas, 1px border/subtle, 18 side padding,
 * 10 top / 12 bottom, 12 gap; 32px logo + wordmark 20/1.72 bold brand/text at the start.
 * Shown below 1280px.
 */
export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-40 border border-border bg-bg px-[17px] pt-[9px] pb-[11px] xl:hidden">
      <Link
        to="/"
        className="flex w-fit items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-brand"
      >
        <Logo size={32} decorative />
        <span className="text-[20px] leading-[1.72] font-bold text-brand-text">{ar.app.name}</span>
      </Link>
    </header>
  );
}
