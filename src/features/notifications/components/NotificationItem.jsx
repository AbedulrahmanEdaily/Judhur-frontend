import { useDispatch } from 'react-redux';
import { Link } from 'react-router';
import clsx from 'clsx';
import { baseApi } from '../../../api/baseApi.js';
import {
  IconFlag16,
  IconNavQueue,
  IconNavReports,
  IconNotificationApproved,
  IconNotificationBell,
  IconNotificationRejected,
  IconLock,
  IconPause,
  IconStar,
} from '../../../components/icons/index.js';
import { useToast } from '../../../components/ui/useToast.js';
import { formatRelativeTime } from '../../../lib/format.js';
import { actionErrorMessage } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { adminNotificationTags } from '../adminNotificationTags.js';
import { useMarkNotificationAsReadMutation } from '../notificationsApi.js';

const text = ar.notifications;

// Figma icon circles: approved check on success-soft, rejected flag on danger-soft, and the bell
// on warning-soft for any other (future) type. Not in Figma: the suspended pause on
// danger-soft, the reviewed-report flag on info-soft, the new-review star (73:1615) on
// warning-soft, the ban lock on danger-soft, and for admins the queue tick on warning-soft and
// the new-report flag on danger-soft — 17px like the others.
const typeIcons = {
  PropertyApproved: { Icon: IconNotificationApproved, classes: 'bg-success-soft text-success' },
  PropertyRejected: { Icon: IconNotificationRejected, classes: 'bg-danger-soft text-danger' },
  PropertySuspended: { Icon: IconPause, classes: 'bg-danger-soft text-danger' },
  ReportResolved: { Icon: IconNavReports, classes: 'bg-info-soft text-info' },
  NewReview: { Icon: IconStar, classes: 'bg-warning-soft text-warning' },
  AccountBanned: { Icon: IconLock, classes: 'bg-danger-soft text-danger' },
  PropertyPendingReview: { Icon: IconNavQueue, classes: 'bg-warning-soft text-warning' },
  NewReport: { Icon: IconFlag16, classes: 'bg-danger-soft text-danger' },
};
const otherTypeIcon = { Icon: IconNotificationBell, classes: 'bg-warning-soft text-warning' };

const PROPERTY_TYPES = ['PropertyApproved', 'PropertyRejected', 'PropertySuspended'];

/**
 * The property notifications open the owner's listing, a reviewed report opens «بلاغاتي», a new
 * review opens my seller page on «التقييمات»; for admins a listing waiting for review opens its
 * review and a new report opens it. Other types have no page.
 */
function notificationPath(notification) {
  if (PROPERTY_TYPES.includes(notification.type) && notification.referenceId) {
    return `/my-properties/${notification.referenceId}`;
  }
  if (notification.type === 'ReportResolved') return '/my-reports';
  if (notification.type === 'NewReview' && notification.referenceId) {
    return `/sellers/${notification.referenceId}#reviews`;
  }
  if (notification.type === 'PropertyPendingReview' && notification.referenceId) {
    return `/admin/properties/${notification.referenceId}`;
  }
  if (notification.type === 'NewReport' && notification.referenceId) {
    return `/admin/reports/${notification.referenceId}`;
  }
  return null;
}

const rowClasses =
  'flex w-full items-start gap-[14px] px-5 py-4 text-start transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand';

/**
 * Figma notification row (76:1296 unread, 76:1357 read): icon circle, the server's title with
 * the time at the end, the body below; an unread row sits on brand/subtle with a bold title and
 * a brand dot (not in Figma: the state is not shown by color alone). Opening it marks it read
 * (always, without checking `isRead`) and, for a listing, goes to the owner's listing page.
 *
 * @param {{
 *   notification: import('../../../api/types.js').Notification,
 *   onOpen?: () => void,
 * }} props
 */
export function NotificationItem({ notification, onOpen }) {
  const toast = useToast();
  const dispatch = useDispatch();
  const [markAsRead] = useMarkNotificationAsReadMutation();

  const { Icon, classes } = typeIcons[notification.type] ?? otherTypeIcon;
  const path = notificationPath(notification);
  const isUnread = !notification.isRead;

  async function handleOpen() {
    if (onOpen) onOpen();
    // The listing, the report or my reviews changed on the server, so the cached copy is stale.
    if (PROPERTY_TYPES.includes(notification.type)) {
      dispatch(
        baseApi.util.invalidateTags([
          'MyProperties',
          { type: 'MyProperty', id: notification.referenceId },
        ]),
      );
    }
    if (notification.type === 'ReportResolved') {
      dispatch(baseApi.util.invalidateTags(['MyReports']));
    }
    if (notification.type === 'NewReview') {
      dispatch(
        baseApi.util.invalidateTags([
          { type: 'SellerProfile', id: notification.referenceId },
          { type: 'SellerReviews', id: notification.referenceId },
        ]),
      );
    }
    const adminTags = adminNotificationTags(notification.type);
    if (adminTags) dispatch(baseApi.util.invalidateTags(adminTags));
    try {
      await markAsRead(notification.id).unwrap();
    } catch (error) {
      toast.show({ tone: 'error', message: actionErrorMessage(error) });
    }
  }

  const content = (
    <>
      <span className={clsx('shrink-0 rounded-full p-[9px]', classes)}>
        <Icon width={17} height={17} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="flex items-start gap-2">
          <span
            className={clsx(
              'min-w-0 flex-1 text-[14.5px] leading-[1.72] text-text',
              isUnread ? 'font-bold' : 'font-semibold',
            )}
          >
            {notification.title}
          </span>
          {isUnread && (
            <span className="mt-2 size-2 shrink-0 rounded-full bg-brand">
              <span className="sr-only">{text.unreadMark}</span>
            </span>
          )}
          <time
            dateTime={notification.createdAtUtc}
            className="shrink-0 text-[11.5px] leading-[1.72] text-text-secondary"
          >
            {formatRelativeTime(notification.createdAtUtc)}
          </time>
        </span>
        <span className="text-[13px] leading-[1.72] text-text-secondary">{notification.body}</span>
      </span>
    </>
  );

  const stateClasses = isUnread ? 'bg-brand-subtle' : 'hover:bg-inset';

  if (path) {
    return (
      <Link to={path} onClick={handleOpen} className={clsx(rowClasses, stateClasses)}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={handleOpen} className={clsx(rowClasses, stateClasses)}>
      {content}
    </button>
  );
}
