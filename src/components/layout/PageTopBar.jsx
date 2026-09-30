import { Link } from 'react-router';
import { IconBackChevron } from '../icons/index.js';
import { ar } from '../../locales/ar.js';

/**
 * Mobile top bar of an inner page — Figma «الشريط العلوي» of «لوحتي» (84:580): back, then the
 * title 16 bold, bg/canvas with a border/subtle line. Hidden from 1280px up (the navbar shows).
 *
 * @param {{ title: string, backTo: string }} props
 */
export function PageTopBar({ title, backTo }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border border-border bg-bg px-[17px] pt-[9px] pb-[11px] xl:hidden">
      <Link
        to={backTo}
        aria-label={ar.listing.back}
        className="rounded-sm text-text focus-visible:outline-2 focus-visible:outline-brand"
      >
        <IconBackChevron />
      </Link>
      <h1 className="text-[16px] leading-[1.72] font-bold text-text">{title}</h1>
    </header>
  );
}
