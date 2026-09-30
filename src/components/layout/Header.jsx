import { useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router';
import clsx from 'clsx';
import { IconAdminShield, IconBell, IconChat } from '../icons/index.js';
import { AccountMenu } from './AccountMenu.jsx';
import { HeaderSearch } from './HeaderSearch.jsx';
import { Logo } from './Logo.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { selectIsAdmin, selectIsAuthenticated } from '../../features/auth/authSlice.js';
import { ar } from '../../locales/ar.js';

// Links without `to` point at pages that are not built yet: they stay visible, not clickable.
const visitorLinks = [
  { label: ar.nav.home, to: '/', end: true },
  { label: ar.nav.properties, to: '/properties' },
  { label: ar.nav.map },
  { label: ar.nav.about },
];
const adminLinks = [
  { label: ar.nav.home, to: '/', end: true },
  { label: ar.nav.properties, to: '/properties' },
  { label: ar.nav.approvals },
  { label: ar.nav.users },
  { label: ar.nav.reports },
];

const iconButtonClasses =
  'rounded-md bg-inset p-[9px] text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';
const primaryActionClasses =
  'rounded-md bg-brand px-[18px] py-2.5 text-[14px] leading-[1.65] font-semibold whitespace-nowrap text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/**
 * Figma "شريط علوي / Navbar" (34:104) — زائر / مستخدم / أدمن. Full width, 40×14 padding,
 * 20 gap, 1px border/subtle. RTL: logo, search, links, then the actions at the far end.
 * Shown from 1280px up; smaller screens use MobileTopBar + MobileTabBar.
 */
export function Header() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const links = isAdmin ? adminLinks : visitorLinks;

  return (
    <header className="sticky top-0 z-40 hidden border border-border bg-bg xl:block">
      <div className="flex items-center gap-5 px-[39px] py-[13px]">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-brand"
        >
          <Logo size={42} decorative />
          <span className="text-[24px] leading-[1.65] font-bold text-brand-text">
            {ar.app.name}
          </span>
        </Link>

        <HeaderSearch />

        <nav aria-label={ar.nav.mainNav}>
          <ul className="flex items-center gap-[26px] text-[14.5px] leading-[1.65] whitespace-nowrap">
            {links.map((link) => (
              <li key={link.label}>
                {link.to ? (
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      clsx(
                        'rounded-sm focus-visible:outline-2 focus-visible:outline-brand',
                        isActive ? 'font-semibold text-brand-text' : 'text-text-secondary',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ) : (
                  <span aria-disabled="true" className="cursor-default text-text-secondary">
                    {link.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1" />

        {!isAuthenticated && (
          <div className="flex items-center gap-2.5">
            <Link to="/register" className={primaryActionClasses}>
              {ar.nav.register}
            </Link>
            <Link
              to="/login"
              className="rounded-md px-[18px] py-2.5 text-[14px] leading-[1.65] font-semibold whitespace-nowrap text-text-secondary focus-visible:outline-2 focus-visible:outline-brand"
            >
              {ar.nav.login}
            </Link>
            <ThemeToggle />
          </div>
        )}

        {isAuthenticated && (
          <div className="flex items-center gap-2.5">
            <AccountMenu />
            {isAdmin && (
              <span
                aria-disabled="true"
                className="flex cursor-default items-center gap-1.5 rounded-md bg-accent-subtle px-3.5 py-2 text-[13px] leading-[1.65] font-semibold whitespace-nowrap text-text"
              >
                <IconAdminShield />
                {ar.nav.adminPanel}
              </span>
            )}
            {/* Admins never post listings, so only regular users see this. */}
            {!isAdmin && (
              <span aria-disabled="true" className={clsx(primaryActionClasses, 'cursor-default')}>
                {ar.nav.addProperty}
              </span>
            )}
            <button
              type="button"
              aria-disabled="true"
              aria-label={ar.nav.notifications}
              className={iconButtonClasses}
            >
              <IconBell />
            </button>
            <button
              type="button"
              aria-disabled="true"
              aria-label={ar.nav.messages}
              className={iconButtonClasses}
            >
              <IconChat />
            </button>
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
}
