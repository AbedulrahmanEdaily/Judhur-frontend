import { useState } from 'react';
import { Link, useParams } from 'react-router';
import clsx from 'clsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { formatNumber, formatRelativeTime } from '../../../lib/format.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { PropertyPhoto } from '../../properties/components/PropertyPhoto.jsx';
import {
  REPORT_REASON_LABELS,
  REPORT_REASON_TONES,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_TONES,
} from '../../reports/constants.js';
import { useGetAdminReportQuery } from '../adminApi.js';
import { AdminShell } from '../components/AdminShell.jsx';
import { ReportDecisionDialog } from '../components/ReportDecisionDialog.jsx';

const text = ar.admin.reports;
const cardClasses =
  'flex flex-col gap-4 rounded-lg border border-border bg-raised px-5 py-5 xl:px-6 xl:py-[22px]';
const titleClasses = 'text-[17px] leading-[1.74] font-bold text-text';
const actionClasses =
  'flex items-center justify-center rounded-md py-3 text-[14px] leading-[1.74] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/**
 * The review page of one report (not in Figma — built from the «مراجعة عقار» cards, 81:751):
 * the report, the listing card with a link to its review page, the reporter, and the decision.
 * The three decisions only while the report is pending; suspending only for a published,
 * not-deleted listing. Each goes through ReportDecisionDialog.
 */
export default function ReviewReportPage() {
  const { reportId } = useParams();
  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useGetAdminReportQuery(reportId, {
    refetchOnMountOrArgChange: true,
  });
  const [action, setAction] = useState(null);

  function finishDecision() {
    setAction(null);
    refetch();
  }

  let content;
  if (isLoading) {
    content = (
      <>
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-[360px] rounded-lg" />
      </>
    );
  } else if (error) {
    const problem = toProblem(error);
    if (problem.status === 404) {
      content = (
        <EmptyState
          title={text.notFoundTitle}
          description={text.notFoundText}
          action={{ label: text.backToReports, to: '/admin/reports' }}
        />
      );
    } else {
      let requestId;
      if (problem.status >= 500) requestId = problem.requestId;
      content = <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />;
    }
  } else {
    const property = report.property;
    const isPending = report.status === 'Pending';
    const canSuspend = property.moderationStatus === 'Approved' && !property.isDeleted;

    content = (
      <>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h1 className="text-[22px] leading-[1.72] font-bold text-text xl:text-[25px]">
              {text.reviewTitle}
            </h1>
            <p className="text-[13.5px] leading-[1.72] text-text-secondary">
              {text.sentAt(formatRelativeTime(report.createdAtUtc))}
            </p>
          </div>
          <Link
            to="/admin/reports"
            className="rounded-md border border-border-strong bg-surface px-[17px] py-[9px] text-[13.5px] leading-[1.74] font-semibold text-text transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {text.backToReports}
          </Link>
        </div>

        <div className="flex flex-col gap-[18px] xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
            <section className={cardClasses}>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={clsx(titleClasses, 'flex-1')}>{text.reportTitle}</h2>
                <Badge tone={REPORT_STATUS_TONES[report.status]}>
                  {REPORT_STATUS_LABELS[report.status]}
                </Badge>
              </div>
              <dl className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <dt className="text-[12px] leading-[1.74] text-muted">{text.reason}</dt>
                  <dd>
                    <Badge tone={REPORT_REASON_TONES[report.reason]}>
                      {REPORT_REASON_LABELS[report.reason]}
                    </Badge>
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[12px] leading-[1.74] text-muted">{text.details}</dt>
                  <dd className="text-[14px] leading-[1.74] whitespace-pre-line text-text">
                    {report.details || text.noDetails}
                  </dd>
                </div>
              </dl>
            </section>

            <section className={cardClasses}>
              <h2 className={titleClasses}>{text.propertyTitle}</h2>
              <div className="flex items-center gap-4">
                <span className="h-[66px] w-[84px] shrink-0 overflow-hidden rounded-[10px]">
                  <PropertyPhoto src={property.mainImageUrl} />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-[15px] leading-[1.72] font-semibold text-text">
                    {`${property.title} — ${property.city}`}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {property.isDeleted && <Badge tone="danger">{text.deleted}</Badge>}
                    {!property.isDeleted && property.moderationStatus !== 'Approved' && (
                      <Badge tone="warning">{text.notPublished}</Badge>
                    )}
                    {!property.isDeleted && !property.isActive && (
                      <Badge tone="neutral">{text.inactive}</Badge>
                    )}
                  </div>
                </div>
              </div>
              {report.otherPendingReportsOnProperty > 0 && (
                <p className="rounded-md bg-warning-soft px-3.5 py-2.5 text-[13px] leading-[1.74] font-semibold text-warning">
                  {text.otherReports(formatNumber(report.otherPendingReportsOnProperty))}
                </p>
              )}
              <Link
                to={`/admin/properties/${property.id}`}
                className="self-start rounded-sm text-[13.5px] leading-[1.74] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
              >
                {text.openProperty}
              </Link>
            </section>
          </div>

          <aside className="flex flex-col gap-[18px] xl:w-[340px] xl:shrink-0">
            <section className={cardClasses}>
              <h2 className={titleClasses}>{text.decisionTitle}</h2>
              {isPending && (
                <>
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => setAction('dismiss')}
                      className={clsx(
                        actionClasses,
                        'border border-border-strong bg-surface text-text hover:bg-inset',
                      )}
                    >
                      {text.dismiss}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAction('resolve')}
                      className={clsx(actionClasses, 'bg-brand text-inverse hover:bg-brand-hover')}
                    >
                      {text.resolve}
                    </button>
                    {canSuspend && (
                      <button
                        type="button"
                        onClick={() => setAction('suspend')}
                        className={clsx(actionClasses, 'bg-danger text-inverse hover:opacity-90')}
                      >
                        {text.resolveSuspend}
                      </button>
                    )}
                  </div>
                  <p className="text-[12px] leading-[1.74] text-muted">{text.decisionHint}</p>
                </>
              )}
              {!isPending && (
                <div className="flex flex-col gap-2">
                  <p className="text-[14px] leading-[1.74] font-semibold text-text">
                    {REPORT_STATUS_LABELS[report.status]}
                  </p>
                  {report.reviewedAtUtc && (
                    <p className="text-[12.5px] leading-[1.74] text-muted">
                      {text.reviewedAt(formatRelativeTime(report.reviewedAtUtc))}
                    </p>
                  )}
                  <p className="text-[12px] leading-[1.74] text-muted">{text.adminNote}</p>
                  <p className="text-[13.5px] leading-[1.74] whitespace-pre-line text-text-secondary">
                    {report.adminNote || text.noAdminNote}
                  </p>
                </div>
              )}
            </section>

            <section className={cardClasses}>
              <h2 className={titleClasses}>{text.reporterTitle}</h2>
              {report.reporter && (
                <div className="flex items-center gap-3">
                  <Avatar
                    name={report.reporter.fullName}
                    imageUrl={report.reporter.profileImageUrl}
                  />
                  <div className="flex min-w-0 flex-col gap-px">
                    <p className="text-[15px] leading-[1.74] font-semibold text-text">
                      {report.reporter.fullName}
                    </p>
                    {report.reporter.phoneNumber && (
                      <p dir="ltr" className="self-start text-[12px] leading-[1.74] text-muted">
                        {report.reporter.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {!report.reporter && (
                <p className="text-[13px] leading-[1.74] text-text-secondary">
                  {text.reporterGone}
                </p>
              )}
            </section>
          </aside>
        </div>

        {action && (
          <ReportDecisionDialog
            action={action}
            report={report}
            onClose={() => setAction(null)}
            onFinished={finishDecision}
          />
        )}
      </>
    );
  }

  return <AdminShell>{content}</AdminShell>;
}
