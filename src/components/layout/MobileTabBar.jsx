import { useEffect, useId, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import clsx from 'clsx';
import {
  IconNavReports,
  IconNavStats,
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
import { useUnreadMessages } from '../../features/conversations/useUnreadMessages.js';
import { UnreadBadge } from '../../features/notifications/components/UnreadBadge.jsx';
import { ar } from '../../locales/ar.js';

const itemClasses = 'flex flex-1 flex-col items-center gap-1 text-[10.5px] leading-[1.72]';
const inactiveClasses = 'text-muted';
const activeClasses = 'font-semibold text-brand-text';

/**
 * Figma mobile "شريط التبويب" (83:577): bg/raised, 1px border/subtle, 12 side padding,
 * 10 top / 20 bottom; five items (21px icons, labels 10.5/1.72) with the "أضف" brand circle
 * in the middle. Admins get «لوحة الإدارة» in the circle and «البلاغات» instead of the chats.
 * Shown below 1280px.
 */
export function MobileTabBar() {
  const { pathname } = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectCurrentUser);
  const { logout, isLoggingOut } = useLogout();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const accountTriggerRef = useRef(null);
  const accountPanelId = useId();

  useEffect(() => {
    if (!isAccountOpen) return undefined;
    function handlePointerDown(event) {
      if (!accountRef.current.contains(event.target)) setIsAccountOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      setIsAccountOpen(false);
      accountTriggerRef.current?.focus();
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountOpen]);
  const unreadMessages = useUnreadMessages();
  const isMessages = pathname.startsWith('/messages');
  const isHome = pathname === '/';
  const isSearch = pathname === '/properties';
  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/properties');
  const isAdminReports = pathname.startsWith('/admin/reports');
  const isAccount =
    pathname === '/dashboard' ||
    pathname === '/favorites' ||
    pathname === '/profile' ||
    pathname === '/notifications' ||
    pathname === '/my-reports' ||
    pathname.startsWith('/my-properties');

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
      {/* Not in the mobile Figma bar: for admins the middle circle opens the admin dashboard. */}
      {isAdmin && (
        <Link
          to="/admin"
          aria-current={isAdminArea ? 'page' : undefined}
          className={clsx(itemClasses, isAdminArea ? activeClasses : inactiveClasses)}
        >
          <span className="rounded-full bg-brand p-[9px] text-inverse">
            <IconNavStats width={21} height={21} />
          </span>
          {ar.nav.adminPanel}
        </Link>
      )}

      {/* Admins have no conversations; guests reach login through the page's guard. */}
      {!isAdmin && (
        <Link
          to="/messages"
          aria-current={isMessages ? 'page' : undefined}
          className={clsx(itemClasses, isMessages ? activeClasses : inactiveClasses)}
        >
          <span className="relative">
            <IconTabChat />
            {unreadMessages.count > 0 && <UnreadBadge count={unreadMessages.count} />}
          </span>
          {ar.nav.messages}
        </Link>
      )}
      {/* Admins have no conversations: that slot opens the reports instead. */}
      {isAdmin && (
        <Link
          to="/admin/reports"
          aria-current={isAdminReports ? 'page' : undefined}
          className={clsx(itemClasses, isAdminReports ? activeClasses : inactiveClasses)}
        >
          <IconNavReports width={21} height={21} />
          {ar.nav.reports}
        </Link>
      )}

      {!isAuthenticated && (
        <Link to="/login" className={clsx(itemClasses, inactiveClasses)}>
          <IconTabAccount />
          {ar.nav.tabAccount}
        </Link>
      )}

      {/* «حسابي» opens «لوحتي» (84:575), which has the logout. Admins get a small panel: the
          email, their profile, the admin pages and the logout. */}
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
        <div ref={accountRef} className="relative flex flex-1">
          <button
            ref={accountTriggerRef}
            type="button"
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            aria-expanded={isAccountOpen}
            aria-controls={accountPanelId}
            className={clsx(itemClasses, inactiveClasses)}
          >
            <IconTabAccount />
            {ar.nav.tabAccount}
          </button>
          {isAccountOpen && (
            <div
              id={accountPanelId}
              className="absolute end-0 bottom-full mb-3 w-64 rounded-md border border-border bg-raised p-2 shadow-menu"
            >
              <div className="px-3 py-2">
                <p className="text-caption text-muted">{ar.auth.account.signedInAs}</p>
                <p className="truncate text-body-sm text-text">{user?.email}</p>
              </div>
              <div className="my-1 h-px bg-border" />
              <Link
                to="/profile"
                onClick={() => setIsAccountOpen(false)}
                className="block rounded-sm px-3 py-2 text-body-sm text-text hover:bg-inset"
              >
                {ar.auth.account.profile}
              </Link>
              <Link
                to="/admin"
                onClick={() => setIsAccountOpen(false)}
                className="block rounded-sm px-3 py-2 text-body-sm text-text hover:bg-inset"
              >
                {ar.admin.nav.dashboardLink}
              </Link>
              <Link
                to="/admin/properties"
                onClick={() => setIsAccountOpen(false)}
                className="block rounded-sm px-3 py-2 text-body-sm text-text hover:bg-inset"
              >
                {ar.admin.nav.queue}
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setIsAccountOpen(false)}
                className="block rounded-sm px-3 py-2 text-body-sm text-text hover:bg-inset"
              >
                {ar.admin.nav.usersLink}
              </Link>
              <Link
                to="/admin/reports"
                onClick={() => setIsAccountOpen(false)}
                className="block rounded-sm px-3 py-2 text-body-sm text-text hover:bg-inset"
              >
                {ar.admin.nav.reports}
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
