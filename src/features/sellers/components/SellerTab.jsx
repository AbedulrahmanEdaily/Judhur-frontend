import { Link } from 'react-router';
import clsx from 'clsx';

/**
 * Figma «تبويب / Tab» (44:762) on the seller page (73:1486, 73:1489): 18 sides, 12 top, the
 * label 15 with a 3px line under it — semibold brand/text on a brand line when active, regular
 * text/secondary with no line otherwise. A link: the tab lives in the URL (`#reviews`), and
 * switching keeps the scroll position.
 *
 * @param {{ to: import('react-router').To, isActive: boolean, children: import('react').ReactNode }} props
 */
export function SellerTab({ to, isActive, children }) {
  return (
    <Link
      to={to}
      preventScrollReset
      aria-current={isActive ? 'page' : undefined}
      className="flex flex-col items-center gap-2.5 rounded-t-md px-[18px] pt-3 text-[15px] leading-[1.65] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
    >
      <span className={clsx(isActive ? 'font-semibold text-brand-text' : 'text-text-secondary')}>
        {children}
      </span>
      <span
        aria-hidden="true"
        className={clsx('h-[3px] w-full rounded-[3px]', isActive && 'bg-brand')}
      />
    </Link>
  );
}
