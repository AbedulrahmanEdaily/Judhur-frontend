import { Link, NavLink } from 'react-router';
import { HeaderSearch } from './HeaderSearch.jsx';
import {
  NAV_LINKS,
  navLinkClasses,
  navPrimaryActionClasses,
  navSecondaryActionClasses,
} from './navStyles.js';
import { ar } from '../../locales/ar.js';

/**
 * Collapsible menu under the header on small screens: search, links, and (for guests) the
 * sign-up/login actions. Signed-in users use the account menu in the header.
 * @param {{ id: string, onNavigate: () => void, showGuestActions: boolean }} props
 */
export function MobileNav({ id, onNavigate, showGuestActions }) {
  return (
    <div id={id} className="border-t border-border bg-bg px-4 pt-4 pb-5 lg:hidden">
      <HeaderSearch onSubmitted={onNavigate} />
      <nav aria-label={ar.nav.mainNav} className="mt-4">
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={onNavigate}
                className={(state) => `${navLinkClasses(state)} block px-2 py-2`}
              >
                {ar.nav[link.key]}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {showGuestActions && (
        <div className="mt-4 flex gap-2.5">
          <Link to="/register" onClick={onNavigate} className={`${navPrimaryActionClasses} flex-1`}>
            {ar.nav.register}
          </Link>
          <Link
            to="/login"
            onClick={onNavigate}
            className={`${navSecondaryActionClasses} flex-1 border border-border-strong`}
          >
            {ar.nav.login}
          </Link>
        </div>
      )}
    </div>
  );
}
