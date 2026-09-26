import { useId, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Menu, X } from 'lucide-react';
import { HeaderSearch } from './HeaderSearch.jsx';
import { LogoLockup } from './LogoLockup.jsx';
import { MobileNav } from './MobileNav.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import {
  NAV_LINKS,
  navLinkClasses,
  navPrimaryActionClasses,
  navSecondaryActionClasses,
} from './navStyles.js';
import { ar } from '../../locales/ar.js';

/**
 * Figma "شريط علوي / Navbar", guest state. In RTL: logo at the start (right), search and links
 * in the middle, actions at the end (left). User/admin states arrive with the auth work.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-3.5 lg:px-10">
        <LogoLockup />

        {/* Visibility lives on wrappers: the inner classes set their own `display`. */}
        <div className="hidden w-[230px] lg:block">
          <HeaderSearch />
        </div>

        <nav aria-label={ar.nav.mainNav} className="hidden lg:block">
          <ul className="flex items-center gap-[26px]">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} className={navLinkClasses}>
                  {ar.nav[link.key]}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2.5 lg:flex">
            <Link to="/register" className={navPrimaryActionClasses}>
              {ar.nav.register}
            </Link>
            <Link to="/login" className={navSecondaryActionClasses}>
              {ar.nav.login}
            </Link>
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? ar.nav.closeMenu : ar.nav.openMenu}
            className="rounded-md bg-inset p-[9px] text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
          >
            {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && <MobileNav id={menuId} onNavigate={closeMenu} />}
    </header>
  );
}
