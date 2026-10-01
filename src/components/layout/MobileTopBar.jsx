import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { IconBell } from '../icons/index.js';
import { Logo } from './Logo.jsx';
import { selectIsAuthenticated } from '../../features/auth/authSlice.js';
import { UnreadBadge } from '../../features/notifications/components/UnreadBadge.jsx';
import { useUnreadCount } from '../../features/notifications/useUnreadCount.js';
import { ar } from '../../locales/ar.js';

/**
 * Figma mobile "الشريط العلوي" (83:477): bg/canvas, 1px border/subtle, 18 side padding,
 * 10 top / 12 bottom, 12 gap; 32px logo + wordmark 20/1.72 bold brand/text at the start.
 * Signed in, the navbar bell (with the unread badge) sits at the end and opens /notifications
 * — not in the mobile Figma frame. Shown below 1280px.
 */
export function MobileTopBar() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { count } = useUnreadCount();

  let bellLabel = ar.notifications.title;
  if (count > 0) bellLabel = ar.notifications.bell(count);

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border border-border bg-bg px-[17px] pt-[9px] pb-[11px] xl:hidden">
      <Link
        to="/"
        className="flex w-fit items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-brand"
      >
        <Logo size={32} decorative />
        <span className="text-[20px] leading-[1.72] font-bold text-brand-text">{ar.app.name}</span>
      </Link>
      <span className="flex-1" />
      {isAuthenticated && (
        <Link
          to="/notifications"
          aria-label={bellLabel}
          className="relative rounded-md bg-inset p-[9px] text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <IconBell />
          {count > 0 && <UnreadBadge count={count} />}
        </Link>
      )}
    </header>
  );
}
