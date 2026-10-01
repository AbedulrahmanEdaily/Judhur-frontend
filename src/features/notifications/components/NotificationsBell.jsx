import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconBell } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import { useUnreadCount } from '../useUnreadCount.js';
import { NotificationsMenu } from './NotificationsMenu.jsx';
import { UnreadBadge } from './UnreadBadge.jsx';

const text = ar.notifications;

/**
 * Figma navbar bell (34:40) for signed-in users and admins: the unread badge (polled each
 * minute) and, on click, the latest notifications. Closes on a click outside or on Escape.
 *
 * @param {{ className: string }} props the navbar's icon button look
 */
export function NotificationsBell({ className }) {
  const { count } = useUnreadCount();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current.contains(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  let label = text.title;
  if (count > 0) label = text.bell(count);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={label}
        className={clsx('relative block', className)}
      >
        <IconBell />
        {count > 0 && <UnreadBadge count={count} />}
      </button>

      {isOpen && (
        <NotificationsMenu id={menuId} unreadCount={count} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}
