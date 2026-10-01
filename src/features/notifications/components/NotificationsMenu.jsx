import { Link } from 'react-router';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { actionErrorMessage, toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
} from '../notificationsApi.js';
import { NotificationItem } from './NotificationItem.jsx';

const text = ar.notifications;
const LATEST_QUERY = { page: 1, pageSize: 5 };

/**
 * The bell's dropdown (not in Figma — the AccountMenu card with the page's rows): the latest 5,
 * «تعليم الكل كمقروء» while some are unread, and «عرض الكل». Mounted only while open, and
 * refetched on every open so new notifications show up.
 *
 * @param {{ id: string, unreadCount: number, onClose: () => void }} props
 */
export function NotificationsMenu({ id, unreadCount, onClose }) {
  const toast = useToast();
  const { data, isLoading, error, refetch } = useGetNotificationsQuery(LATEST_QUERY, {
    refetchOnMountOrArgChange: true,
  });
  const [markAllAsRead, markAllState] = useMarkAllNotificationsAsReadMutation();

  async function handleMarkAll() {
    try {
      await markAllAsRead().unwrap();
    } catch (markError) {
      toast.show({ tone: 'error', message: actionErrorMessage(markError) });
    }
  }

  let content;
  if (isLoading) {
    content = (
      <div className="flex flex-col gap-4 px-5 py-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  } else if (error) {
    content = (
      <div className="flex flex-col items-center gap-2 px-5 py-6 text-center">
        <p className="text-[13px] leading-[1.72] text-text-secondary">{toProblem(error).message}</p>
        <button
          type="button"
          onClick={refetch}
          className="rounded-sm text-[13px] leading-[1.72] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
        >
          {ar.common.retry}
        </button>
      </div>
    );
  } else if (data.items.length === 0) {
    content = (
      <p className="px-5 py-8 text-center text-[13.5px] leading-[1.72] text-text-secondary">
        {text.emptyTitle}
      </p>
    );
  } else {
    content = (
      <ul className="max-h-[420px] divide-y divide-border overflow-y-auto">
        {data.items.map((notification) => (
          <li key={notification.id}>
            <NotificationItem notification={notification} onOpen={onClose} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      id={id}
      className="absolute end-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-md border border-border bg-raised shadow-menu"
    >
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <h2 className="flex-1 text-[15px] leading-[1.72] font-bold text-text">{text.title}</h2>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={markAllState.isLoading}
            className="rounded-sm text-[13px] leading-[1.72] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60"
          >
            {text.markAllReadMenu}
          </button>
        )}
      </div>
      {content}
      <Link
        to="/notifications"
        onClick={onClose}
        className="block border-t border-border px-5 py-3 text-center text-[13.5px] leading-[1.72] font-semibold text-brand-text hover:bg-inset focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
      >
        {text.viewAll}
      </Link>
    </div>
  );
}
