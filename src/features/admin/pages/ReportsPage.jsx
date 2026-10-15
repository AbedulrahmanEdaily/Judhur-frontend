import { Link, useSearchParams } from 'react-router';
import clsx from 'clsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { formatNumber, formatRelativeTime } from '../../../lib/format.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import {
  REPORT_REASON_LABELS,
  REPORT_REASON_TONES,
  REPORT_STATUS_LABELS,
  REPORT_STATUSES,
} from '../../reports/constants.js';
import { useGetAdminReportsQuery } from '../adminApi.js';
import { AdminShell } from '../components/AdminShell.jsx';

const text = ar.admin.reports;
const PAGE_SIZE = 10;

// Figma reason pill (82:1161): 10×4, radius full, 11.5 semibold.
const reasonToneClasses = {
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  neutral: 'bg-inset text-text-secondary',
};

/** `?page=` as a whole number from 1. */
function readPage(searchParams) {
  const page = Math.floor(Number(searchParams.get('page')));
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

/** `?status=` when it is one of the three, else Pending. */
function readStatus(searchParams) {
  const status = searchParams.get('status');
  if (REPORT_STATUSES.includes(status)) return status;
  return 'Pending';
}

/**
 * Figma "البلاغات — أدمن" (82:1026): the title and its line, then one row per report — the
 * listing title, the reason pill, the time and «افحص». The status tabs, the «N بلاغات» and
 * «محذوف» badges are not in Figma; the row's «أوقف العقار» / «تجاهل» live on the review page
 * (the list does not say whether the listing can be suspended). 10 per page; Pending is the
 * oldest first.
 */
export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  const status = readStatus(searchParams);
  const { data, isLoading, isFetching, error, refetch } = useGetAdminReportsQuery({
    status,
    page,
    pageSize: PAGE_SIZE,
  });

  function show(nextStatus, nextPage) {
    const params = new URLSearchParams();
    if (nextStatus !== 'Pending') params.set('status', nextStatus);
    if (nextPage > 1) params.set('page', String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 0 });
  }

  let content;
  if (isLoading) {
    content = <Skeleton className="h-[340px] rounded-lg" />;
  } else if (error) {
    const problem = toProblem(error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    content = <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />;
  } else if (data.items.length === 0 && page > 1) {
    content = (
      <EmptyState
        title={text.emptyClosedTitle}
        action={{ label: text.backToFirstPage, onClick: () => show(status, 1) }}
      />
    );
  } else if (data.items.length === 0 && status === 'Pending') {
    content = <EmptyState title={text.emptyPendingTitle} description={text.emptyPendingText} />;
  } else if (data.items.length === 0) {
    content = <EmptyState title={text.emptyClosedTitle} />;
  } else {
    content = (
      <>
        <ul
          aria-busy={isFetching || undefined}
          className="divide-y divide-border rounded-lg border border-border bg-raised"
        >
          {data.items.map((report) => (
            <li
              key={report.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2.5 px-5 py-[15px] xl:flex-nowrap"
            >
              <div className="flex min-w-0 basis-full flex-col gap-0.5 xl:flex-1 xl:basis-auto">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/admin/reports/${report.id}`}
                    className="min-w-0 truncate rounded-sm text-[14px] leading-[1.72] font-semibold text-text hover:text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    {report.propertyTitle}
                  </Link>
                  {report.propertyIsDeleted && <Badge tone="danger">{text.deleted}</Badge>}
                  {report.pendingReportsOnProperty > 1 && (
                    <Badge tone="warning">
                      {text.reportCount(formatNumber(report.pendingReportsOnProperty))}
                    </Badge>
                  )}
                </div>
                <div className="flex">
                  <span
                    className={clsx(
                      'rounded-full px-2.5 py-1 text-[11.5px] leading-[1.72] font-semibold',
                      reasonToneClasses[REPORT_REASON_TONES[report.reason]],
                    )}
                  >
                    {REPORT_REASON_LABELS[report.reason]}
                  </span>
                </div>
              </div>
              <span className="flex-1 text-[12px] leading-[1.72] text-muted xl:w-[110px] xl:flex-none">
                {formatRelativeTime(report.createdAtUtc)}
              </span>
              <Link
                to={`/admin/reports/${report.id}`}
                className="rounded-[9px] border border-border-strong bg-surface px-[12px] py-[6px] text-[12px] leading-[1.72] font-semibold text-text transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {text.inspect}
              </Link>
            </li>
          ))}
        </ul>
        <Pagination
          page={data.pageNumber}
          totalPages={data.totalPages}
          onPageChange={(nextPage) => show(status, nextPage)}
        />
      </>
    );
  }

  let subtitle = null;
  if (data && status === 'Pending') subtitle = text.subtitle(formatNumber(data.totalCount));
  if (data && status !== 'Pending') subtitle = text.subtitleClosed(formatNumber(data.totalCount));

  return (
    <AdminShell>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[22px] leading-[1.72] font-bold text-text xl:text-[25px]">
          {text.title}
        </h1>
        {subtitle && <p className="text-[13.5px] leading-[1.72] text-text-secondary">{subtitle}</p>}
      </div>

      <nav aria-label={text.tabs} className="flex flex-wrap gap-2">
        {REPORT_STATUSES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => show(value, 1)}
            aria-current={value === status ? 'page' : undefined}
            className={clsx(
              'rounded-full border px-4 py-1.5 text-[13px] leading-[1.72] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
              value === status && 'border-brand bg-brand-subtle font-semibold text-brand-text',
              value !== status && 'border-border bg-raised text-text-secondary hover:bg-inset',
            )}
          >
            {REPORT_STATUS_LABELS[value]}
          </button>
        ))}
      </nav>

      {content}
    </AdminShell>
  );
}
