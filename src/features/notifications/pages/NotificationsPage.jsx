import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';
import { AccountShell } from '../../../components/layout/AccountShell.jsx';
import { PageTopBar } from '../../../components/layout/PageTopBar.jsx';
import { IconNotificationBell } from '../../../components/icons/index.js';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { formatDate, formatNumber } from '../../../lib/format.js';
import { actionErrorMessage, toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { AdminShell } from '../../admin/components/AdminShell.jsx';
import { selectIsAdmin } from '../../auth/authSlice.js';
import { useGetMyPropertiesQuery } from '../../properties/propertiesApi.js';
import { NotificationItem } from '../components/NotificationItem.jsx';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
} from '../notificationsApi.js';
import { useUnreadCount } from '../useUnreadCount.js';

const text = ar.notifications;
const PAGE_SIZE = 20;
const groupClasses = 'overflow-hidden rounded-lg border border-border bg-raised';

/** `?page=` as a whole number from 1. */
function readPage(searchParams) {
  const page = Math.floor(Number(searchParams.get('page')));
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

/** «اليوم», «أمس», or the date — by the user's local day. */
function dayLabel(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return text.today;
  if (date.toDateString() === yesterday.toDateString()) return text.yesterday;
  return formatDate(date);
}

/** The page's notifications (already newest first) in one group per day. */
function groupByDay(notifications) {
  const groups = [];
  for (const notification of notifications) {
    const date = new Date(notification.createdAtUtc);
    const key = date.toDateString();
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.key === key) {
      lastGroup.items.push(notification);
    } else {
      groups.push({ key, label: dayLabel(date), items: [notification] });
    }
  }
  return groups;
}

/**
 * Figma "الإشعارات — مستخدم" (76:1172): the title with the unread count and «علّم الكل كمقروء»,
 * then one card per day («اليوم», «أمس», …) with a row per notification, 20 per page. Users
 * get the account sidebar; admins (who get notifications too) the admin sidebar.
 */
export default function NotificationsPage() {
  const isAdmin = useSelector(selectIsAdmin);
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  const { data, isLoading, error, refetch } = useGetNotificationsQuery({
    page,
    pageSize: PAGE_SIZE,
  });
  const unread = useUnreadCount();
  const [markAllAsRead, markAllState] = useMarkAllNotificationsAsReadMutation();
  const myProperties = useGetMyPropertiesQuery(undefined, { skip: isAdmin });

  function changePage(nextPage) {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set('page', String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 0 });
  }

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
      <div className={`${groupClasses} flex flex-col gap-5 px-5 py-4`}>
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    );
  } else if (error) {
    const problem = toProblem(error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    content = <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />;
  } else if (data.items.length === 0 && page > 1) {
    content = (
      <EmptyState
        icon={IconNotificationBell}
        title={text.emptyTitle}
        action={{ label: text.previousPage, onClick: () => changePage(page - 1) }}
      />
    );
  } else if (data.items.length === 0) {
    content = (
      <EmptyState
        icon={IconNotificationBell}
        title={text.emptyTitle}
        description={text.emptyText}
      />
    );
  } else {
    content = (
      <>
        {groupByDay(data.items).map((group) => (
          <section key={group.key} className="flex flex-col gap-2.5">
            <h2 className="text-[14px] leading-[1.72] font-semibold text-muted">{group.label}</h2>
            <ul className={`${groupClasses} divide-y divide-border`}>
              {group.items.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem notification={notification} />
                </li>
              ))}
            </ul>
          </section>
        ))}
        <Pagination page={data.pageNumber} totalPages={data.totalPages} onPageChange={changePage} />
      </>
    );
  }

  let subtitle = null;
  if (unread.count === 1) subtitle = text.unreadOne;
  if (unread.count > 1) subtitle = text.unread(formatNumber(unread.count));

  const body = (
    <>
      <div className="flex items-end gap-4">
        <div className="flex flex-1 flex-col gap-0.5">
          <h1 className="hidden text-[25px] leading-[1.72] font-bold text-text xl:block">
            {text.title}
          </h1>
          {subtitle && (
            <p className="text-[13.5px] leading-[1.72] text-text-secondary">{subtitle}</p>
          )}
        </div>
        {unread.count > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={markAllState.isLoading}
            className="rounded-sm text-[13px] leading-[1.72] font-semibold whitespace-nowrap text-brand-text focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60"
          >
            {text.markAllRead}
          </button>
        )}
      </div>
      {content}
    </>
  );

  if (isAdmin) {
    return (
      <>
        <PageTopBar title={text.title} backTo="/admin/properties" />
        <AdminShell>{body}</AdminShell>
      </>
    );
  }
  return (
    <>
      <PageTopBar title={text.title} backTo="/dashboard" />
      <AccountShell listingsCount={myProperties.data?.length}>{body}</AccountShell>
    </>
  );
}
