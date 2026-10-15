import { Link } from 'react-router';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { formatNumber, formatRelativeTime } from '../../../lib/format.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { PropertyPhoto } from '../../properties/components/PropertyPhoto.jsx';
import { useGetPendingPropertiesQuery } from '../adminApi.js';
import { AdminShell } from '../components/AdminShell.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { useGetAdminStatsQuery } from '../usersApi.js';

const text = ar.admin.dashboard;
const QUEUE_PREVIEW_SIZE = 3;

const panelClasses =
  'flex min-w-0 flex-1 flex-col gap-3.5 rounded-lg border border-border bg-raised px-4 pt-[18px] pb-4 xl:px-[22px] xl:pt-[22px] xl:pb-5';
const panelTitleClasses = 'text-[16px] leading-[1.72] font-bold text-text xl:text-[17px]';
const linkClasses =
  'rounded-sm text-[12.5px] leading-[1.72] font-semibold text-brand-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/** A label and its count, as a link when it opens a list. */
function renderCountRow(label, value, to) {
  const count = (
    <span className="text-[15px] leading-[1.72] font-bold text-text">{formatNumber(value)}</span>
  );
  if (to) {
    return (
      <li key={label}>
        <Link
          to={to}
          className="flex items-center gap-3 rounded-md py-1.5 text-[13.5px] leading-[1.72] text-text-secondary hover:text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
        >
          <span className="flex-1">{label}</span>
          {count}
        </Link>
      </li>
    );
  }
  return (
    <li
      key={label}
      className="flex items-center gap-3 py-1.5 text-[13.5px] leading-[1.72] text-text-secondary"
    >
      <span className="flex-1">{label}</span>
      {count}
    </li>
  );
}

/**
 * Figma "لوحة الإحصائيات — أدمن" (80:472), `GET /Admin/Stats` (asked again on every visit): four
 * stat cards (users with the new ones this week, published, waiting for review → the queue,
 * open reports → the reports), then «بانتظار الموافقة» — the three oldest in the queue, each
 * opening its review (Figma's quick approve / reject stay on the review page). Figma's AI usage
 * chart has no API: the last seven days' activity takes its place, and two more cards break
 * down the users (banned → the banned users) and the listings.
 */
export default function DashboardPage() {
  const stats = useGetAdminStatsQuery(undefined, { refetchOnMountOrArgChange: true });
  const queue = useGetPendingPropertiesQuery({ page: 1, pageSize: QUEUE_PREVIEW_SIZE });

  let content;
  if (stats.isLoading) {
    content = (
      <>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
          <Skeleton className="h-[106px] rounded-lg" />
          <Skeleton className="h-[106px] rounded-lg" />
          <Skeleton className="h-[106px] rounded-lg" />
          <Skeleton className="h-[106px] rounded-lg" />
        </div>
        <Skeleton className="h-[260px] rounded-lg" />
      </>
    );
  } else if (stats.error) {
    const problem = toProblem(stats.error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    content = (
      <ErrorState message={problem.message} requestId={requestId} onRetry={stats.refetch} />
    );
  } else {
    const { users, properties, pendingReports, lastSevenDays } = stats.data;

    let newUsersNote;
    if (users.newUsers > 0) newUsersNote = text.newThisWeek(formatNumber(users.newUsers));

    let queueList;
    if (queue.isLoading) {
      queueList = <Skeleton className="h-[150px] rounded-md" />;
    } else if (queue.error) {
      queueList = <ErrorState message={toProblem(queue.error).message} onRetry={queue.refetch} />;
    } else if (queue.data.items.length === 0) {
      queueList = <p className="py-6 text-center text-[13.5px] text-muted">{text.queueEmpty}</p>;
    } else {
      queueList = (
        <ul className="flex flex-col">
          {queue.data.items.map((property) => (
            <li key={property.id} className="flex items-center gap-3 py-[9px]">
              <span className="h-[38px] w-[46px] shrink-0 overflow-hidden rounded-[9px]">
                <PropertyPhoto src={property.mainImageUrl} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13.5px] leading-[1.72] font-semibold text-text">
                  {property.title}
                </span>
                <span className="truncate text-[11.5px] leading-[1.72] text-muted">
                  {`${property.city} · ${formatRelativeTime(property.createdAtUtc)}`}
                </span>
              </span>
              <Link
                to={`/admin/properties/${property.id}`}
                className="shrink-0 rounded-[9px] bg-brand px-3 py-1.5 text-[12px] leading-[1.72] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {text.inspect}
              </Link>
            </li>
          ))}
        </ul>
      );
    }

    content = (
      <>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
          <StatCard
            label={text.users}
            value={users.totalUsers}
            note={newUsersNote}
            to="/admin/users"
          />
          <StatCard label={text.published} value={properties.published} />
          <StatCard
            label={text.waitingForReview}
            value={properties.waitingForReview}
            to="/admin/properties"
          />
          <StatCard label={text.pendingReports} value={pendingReports} to="/admin/reports" />
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-5">
          <section aria-labelledby="dashboard-queue" className={panelClasses}>
            <div className="flex items-center gap-3">
              <h2 id="dashboard-queue" className={panelTitleClasses}>
                {text.queueTitle}
              </h2>
              <span className="flex-1" />
              <Link to="/admin/properties" className={linkClasses}>
                {text.wholeQueue}
              </Link>
            </div>
            {queueList}
          </section>

          <section aria-labelledby="dashboard-week" className={panelClasses}>
            <h2 id="dashboard-week" className={panelTitleClasses}>
              {text.weekTitle}
            </h2>
            <ul className="flex flex-col divide-y divide-border">
              {renderCountRow(text.week.newUsers, lastSevenDays.newUsers)}
              {renderCountRow(text.week.newListings, lastSevenDays.newListings)}
              {renderCountRow(text.week.messages, lastSevenDays.messages)}
              {renderCountRow(text.week.reviews, lastSevenDays.reviews)}
              {renderCountRow(text.week.reports, lastSevenDays.reports)}
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-5">
          <section aria-labelledby="dashboard-users" className={panelClasses}>
            <h2 id="dashboard-users" className={panelTitleClasses}>
              {text.usersTitle}
            </h2>
            <ul className="flex flex-col divide-y divide-border">
              {renderCountRow(text.bannedUsers, users.bannedUsers, '/admin/users?status=Banned')}
              {renderCountRow(
                text.unconfirmedUsers,
                users.unconfirmedUsers,
                '/admin/users?status=Unconfirmed',
              )}
            </ul>
          </section>

          <section aria-labelledby="dashboard-listings" className={panelClasses}>
            <h2 id="dashboard-listings" className={panelTitleClasses}>
              {text.listingsTitle}
            </h2>
            <ul className="flex flex-col divide-y divide-border">
              {renderCountRow(text.listings.incomplete, properties.incomplete)}
              {renderCountRow(text.listings.rejected, properties.rejected)}
              {renderCountRow(text.listings.inactive, properties.inactive)}
              {renderCountRow(text.listings.sold, properties.sold)}
              {renderCountRow(text.listings.rented, properties.rented)}
            </ul>
          </section>
        </div>
      </>
    );
  }

  return (
    <AdminShell>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[22px] leading-[1.72] font-bold text-text xl:text-[25px]">
          {text.title}
        </h1>
        <p className="text-[13.5px] leading-[1.72] text-text-secondary">{text.subtitle}</p>
      </div>
      {content}
    </AdminShell>
  );
}
