import { NavLink, useMatch } from 'react-router';
import clsx from 'clsx';
import {
  IconNavChats,
  IconNavDashboard,
  IconNavFavorites,
  IconNavListings,
  IconNavNotifications,
  IconNavProfile,
  IconNavReports,
} from '../icons/index.js';
import { useUnreadMessages } from '../../features/conversations/useUnreadMessages.js';
import { useFavoriteIds } from '../../features/favorites/useFavoriteIds.js';
import { useGetMyPropertiesQuery } from '../../features/properties/propertiesApi.js';
import { useUnreadCount } from '../../features/notifications/useUnreadCount.js';
import { formatNumber } from '../../lib/format.js';
import { ar } from '../../locales/ar.js';

const text = ar.accountNav;

const itemClasses =
  'flex items-center gap-2.5 rounded-md px-3.5 py-[11px] text-[14.5px] leading-[1.72] focus-visible:outline-2 focus-visible:outline-brand';

/** The count pill: brand on the open page, bg/inset elsewhere. */
function countClasses(isActive) {
  return clsx(
    'rounded-full px-2 py-0.5 text-[11px] leading-[1.72] font-semibold',
    isActive ? 'bg-brand text-inverse' : 'bg-inset text-text-secondary',
  );
}

function navItemClasses({ isActive }) {
  return clsx(
    itemClasses,
    isActive && 'bg-brand-subtle font-semibold text-brand-text',
    !isActive && 'text-text-secondary transition-colors hover:bg-inset',
  );
}

/**
 * The account pages' frame — Figma "المحتوى" of «لوحتي» / «عقاراتي» (74:594, 75:667): the page
 * on bg/surface with 70px sides, and from 1280px up the 264px sidebar (75:669) at the start:
 * items 14×11, radius md, 18px icon, 14.5 label; the active one on brand/subtle with a brand
 * count pill, the others text/secondary with a bg/inset pill. The favorites count comes from
 * the cached ids list (useFavoriteIds); the conversations and notifications counts are the
 * unread ones (shown when there are some).
 *
 * The listings count comes from the cached `/mine` list the sidebar reads itself, so every
 * account page shows the same numbers.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
export function AccountShell({ children }) {
  const myProperties = useGetMyPropertiesQuery();
  const listingsCount = myProperties.data?.length;
  const isListingsActive = useMatch({ path: '/my-properties', end: false }) !== null;
  const isFavoritesActive = useMatch('/favorites') !== null;
  const isNotificationsActive = useMatch('/notifications') !== null;
  const isMessagesActive = useMatch({ path: '/messages', end: false }) !== null;
  const favorites = useFavoriteIds();
  const unread = useUnreadCount();
  const unreadMessages = useUnreadMessages();

  return (
    <div className="min-h-full bg-surface">
      <div className="flex items-start gap-6 px-4 pt-4 pb-5 xl:px-[70px] xl:pt-[26px] xl:pb-[60px]">
        <nav
          aria-label={text.label}
          className="hidden w-[264px] shrink-0 flex-col gap-1.5 rounded-lg border border-border bg-raised px-[13px] py-[21px] xl:flex"
        >
          <NavLink to="/dashboard" end className={navItemClasses}>
            <IconNavDashboard className="shrink-0" />
            {text.dashboard}
          </NavLink>
          <NavLink to="/my-properties" className={navItemClasses}>
            <IconNavListings className="shrink-0" />
            {text.myProperties}
            <span className="flex-1" />
            {listingsCount !== undefined && (
              <span className={countClasses(isListingsActive)}>{formatNumber(listingsCount)}</span>
            )}
          </NavLink>
          <NavLink to="/favorites" className={navItemClasses}>
            <IconNavFavorites className="shrink-0" />
            {text.favorites}
            <span className="flex-1" />
            {favorites.isLoaded && (
              <span className={countClasses(isFavoritesActive)}>
                {formatNumber(favorites.count)}
              </span>
            )}
          </NavLink>
          <NavLink to="/messages" className={navItemClasses}>
            <IconNavChats className="shrink-0" />
            {text.chats}
            <span className="flex-1" />
            {unreadMessages.count > 0 && (
              <span className={countClasses(isMessagesActive)}>
                {formatNumber(unreadMessages.count)}
              </span>
            )}
          </NavLink>
          <NavLink to="/notifications" className={navItemClasses}>
            <IconNavNotifications className="shrink-0" />
            {text.notifications}
            <span className="flex-1" />
            {unread.count > 0 && (
              <span className={countClasses(isNotificationsActive)}>
                {formatNumber(unread.count)}
              </span>
            )}
          </NavLink>
          <NavLink to="/my-reports" className={navItemClasses}>
            <IconNavReports className="shrink-0" />
            {text.reports}
          </NavLink>
          <NavLink to="/profile" className={navItemClasses}>
            <IconNavProfile className="shrink-0" />
            {text.profile}
          </NavLink>
        </nav>
        <div className="flex min-w-0 flex-1 flex-col gap-4 xl:gap-5">{children}</div>
      </div>
    </div>
  );
}
