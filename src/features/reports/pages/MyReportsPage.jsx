import { Link, useSearchParams } from 'react-router';
import { AccountShell } from '../../../components/layout/AccountShell.jsx';
import { PageTopBar } from '../../../components/layout/PageTopBar.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { formatDate, formatNumber } from '../../../lib/format.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { useGetMyPropertiesQuery } from '../../properties/propertiesApi.js';
import {
  REPORT_REASON_LABELS,
  REPORT_REASON_TONES,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_TONES,
} from '../constants.js';
import { useGetMyReportsQuery } from '../reportsApi.js';

const text = ar.reports;
const PAGE_SIZE = 10;

/** `?page=` as a whole number from 1. */
function readPage(searchParams) {
  const page = Math.floor(Number(searchParams.get('page')));
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

/**
 * «بلاغاتي» (not in Figma): the account sidebar, then one card per report, newest first — the
 * listing title (a link to the public page, which says «العقار غير متاح» once it is hidden), the
 * status badge, the reason, the dates, the user's own details and «رد الإدارة» when the admin
 * left a note. 10 per page.
 */
export default function MyReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  const { data, isLoading, error, refetch } = useGetMyReportsQuery({ page, pageSize: PAGE_SIZE });
  const myProperties = useGetMyPropertiesQuery();

  function changePage(nextPage) {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set('page', String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 0 });
  }

  let content;
  if (isLoading) {
    content = (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-[140px] rounded-lg" />
        <Skeleton className="h-[140px] rounded-lg" />
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
        title={text.myEmptyTitle}
        action={{ label: text.previousPage, onClick: () => changePage(page - 1) }}
      />
    );
  } else if (data.items.length === 0) {
    content = (
      <EmptyState
        title={text.myEmptyTitle}
        description={text.myEmptyText}
        action={{ label: text.browse, to: '/properties' }}
      />
    );
  } else {
    content = (
      <>
        <ul className="flex flex-col gap-3">
          {data.items.map((report) => (
            <li
              key={report.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-raised px-4 py-4 xl:px-[22px] xl:py-5"
            >
              <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                <Link
                  to={`/properties/${report.propertyId}`}
                  className="min-w-0 flex-1 rounded-sm text-[15px] leading-[1.72] font-semibold text-text hover:text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
                >
                  {report.propertyTitle}
                </Link>
                <Badge tone={REPORT_STATUS_TONES[report.status]}>
                  {REPORT_STATUS_LABELS[report.status]}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] leading-[1.72] text-muted">
                <Badge tone={REPORT_REASON_TONES[report.reason]}>
                  {REPORT_REASON_LABELS[report.reason]}
                </Badge>
                <span>{text.sentOn(formatDate(report.createdAtUtc))}</span>
                {report.reviewedAtUtc && (
                  <span>{text.reviewedOn(formatDate(report.reviewedAtUtc))}</span>
                )}
              </div>
              {report.details && (
                <p className="text-[13.5px] leading-[1.72] whitespace-pre-line text-text-secondary">
                  <span className="font-semibold text-text">{`${text.yourDetails}: `}</span>
                  {report.details}
                </p>
              )}
              {report.adminNote && (
                <div className="flex flex-col gap-1 rounded-md bg-inset px-3.5 py-3">
                  <p className="text-[12.5px] leading-[1.72] font-semibold text-text">
                    {text.adminReply}
                  </p>
                  <p className="text-[13.5px] leading-[1.72] whitespace-pre-line text-text-secondary">
                    {report.adminNote}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
        <Pagination page={data.pageNumber} totalPages={data.totalPages} onPageChange={changePage} />
      </>
    );
  }

  return (
    <>
      <PageTopBar title={text.myTitle} backTo="/dashboard" />
      <AccountShell listingsCount={myProperties.data?.length}>
        <div className="flex flex-col gap-0.5">
          <h1 className="hidden text-[25px] leading-[1.72] font-bold text-text xl:block">
            {text.myTitle}
          </h1>
          {data && data.totalCount > 0 && (
            <p className="text-[13.5px] leading-[1.72] text-text-secondary">
              {text.mySubtitle(formatNumber(data.totalCount))}
            </p>
          )}
        </div>
        {content}
      </AccountShell>
    </>
  );
}
