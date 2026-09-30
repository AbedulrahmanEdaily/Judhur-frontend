import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import clsx from 'clsx';
import {
  IconTabAccount,
  IconTabChat,
  IconTabHome,
  IconTabPlus,
  IconTabSearch,
} from '../icons/index.js';
import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsAuthenticated,
} from '../../features/auth/authSlice.js';
import { useLogout } from '../../features/auth/hooks/useLogout.js';
import { ar } from '../../locales/ar.js';

const itemClasses = 'flex flex-1 flex-col items-center gap-1 text-[10.5px] leading-[1.72]';
const inactiveClasses = 'text-muted';
const activeClasses = 'font-semibold text-brand-text';

/**
 * Figma mobile "شريط التبويب" (83:577): bg/raised, 1px border/subtle, 12 side padding,
 * 10 top / 20 bottom; five items (21px icons, labels 10.5/1.72) with the "أضف" brand circle
 * in the middle. Items whose page is not built yet are visible but not clickable.
 * Shown below 1280px.
 */
export function MobileTabBar() {
  const { pathname } = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectCurrentUser);
  const { logout, isLoggingOut } = useLogout();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const isHome = pathname === '/';
  const isSearch = pathname === '/properties';
  const isAccount = pathname === '/dashboard' || pathname.startsWith('/my-properties');

  return (
    <nav
      aria-label={ar.nav.mainNav}
      className="fixed inset-x-0 bottom-0 z-40 flex items-start border border-border bg-raised px-[11px] pt-[9px] pb-[19px] xl:hidden"
    >
      <Link
        to="/"
        aria-current={isHome ? 'page' : undefined}
        className={clsx(itemClasses, isHome ? activeClasses : inactiveClasses)}
      >
        <IconTabHome />
        {ar.nav.home}
      </Link>

      <Link
        to="/properties"
        aria-current={isSearch ? 'page' : undefined}
        className={clsx(itemClasses, isSearch ? activeClasses : inactiveClasses)}
      >
        <IconTabSearch />
        {ar.nav.tabSearch}
      </Link>

      {/* Admins never post listings; guests reach login through the page's guard. */}
      {!isAdmin && (
        <Link to="/properties/new" className={clsx(itemClasses, inactiveClasses)}>
          <span className="rounded-full bg-brand p-[9px] text-inverse">
            <IconTabPlus />
          </span>
          {ar.nav.tabAdd}
        </Link>
      )}
      {isAdmin && (
        <span aria-disabled="true" className={clsx(itemClasses, inactiveClasses)}>
          <span className="rounded-full bg-brand p-[9px] text-inverse">
            <IconTabPlus />
          </span>
          {ar.nav.tabAdd}
        </span>
      )}

      <span aria-disabled="true" className={clsx(itemClasses, inactiveClasses)}>
        <IconTabChat />
        {ar.nav.messages}
      </span>

      {!isAuthenticated && (
        <Link to="/login" className={clsx(itemClasses, inactiveClasses)}>
          <IconTabAccount />
          {ar.nav.tabAccount}
        </Link>
      )}

      {/* «حسابي» opens «لوحتي» (84:575), which has the logout. Admins have no account pages yet,
          so they get a small email + logout panel. */}
      {isAuthenticated && !isAdmin && (
        <Link
          to="/dashboard"
          aria-current={isAccount ? 'page' : undefined}
          className={clsx(itemClasses, isAccount ? activeClasses : inactiveClasses)}
        >
          <IconTabAccount />
          {ar.nav.tabAccount}
        </Link>
      )}

      {isAuthenticated && isAdmin && (
        <div className="relative flex flex-1">
          <button
            type="button"
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            aria-expanded={isAccountOpen}
            className={clsx(itemClasses, inactiveClasses)}
          >
            <IconTabAccount />
            {ar.nav.tabAccount}
          </button>
          {isAccountOpen && (
            <div className="absolute end-0 bottom-full mb-3 w-64 rounded-md border border-border bg-raised p-2 shadow-menu">
              <div className="px-3 py-2">
                <p className="text-caption text-muted">{ar.auth.account.signedInAs}</p>
                <p className="truncate text-body-sm text-text">{user?.email}</p>
              </div>
              <div className="my-1 h-px bg-border" />
              <Link
                to="/admin/properties"
                onClick={() => setIsAccountOpen(false)}
                className="block rounded-sm px-3 py-2 text-body-sm text-text hover:bg-inset"
              >
                {ar.admin.nav.queue}
              </Link>
              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                onClick={logout}
                disabled={isLoggingOut}
                className="w-full rounded-sm px-3 py-2 text-start text-body-sm text-danger hover:bg-danger-soft disabled:opacity-60"
              >
                {ar.auth.account.logout}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
