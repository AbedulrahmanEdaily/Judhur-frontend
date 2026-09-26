import clsx from 'clsx';

// Figma navbar actions: 14px semibold, 10px × 18px padding.
const navAction =
  'inline-flex items-center justify-center rounded-md px-[18px] py-2.5 text-[14px] leading-[1.65] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

export const navPrimaryActionClasses = clsx(
  navAction,
  'bg-brand text-inverse hover:bg-brand-hover',
);
export const navSecondaryActionClasses = clsx(navAction, 'text-text-secondary hover:bg-inset');

/** @param {{ isActive: boolean }} state */
export function navLinkClasses({ isActive }) {
  return clsx(
    'rounded-sm text-[14.5px] leading-[1.65] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    isActive ? 'font-semibold text-brand-text' : 'text-text-secondary hover:text-text',
  );
}

export const NAV_LINKS = [
  { to: '/', key: 'home', end: true },
  { to: '/properties', key: 'properties', end: false },
];
