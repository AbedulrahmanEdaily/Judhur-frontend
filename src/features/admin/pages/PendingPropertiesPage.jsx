import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Badge } from '../../../components/ui/Badge.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { formatNumber, formatPrice, formatRelativeTime } from '../../../lib/format.js';
import { actionErrorMessage, toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { PropertyPhoto } from '../../properties/components/PropertyPhoto.jsx';
import { RowActionsMenu } from '../../properties/components/RowActionsMenu.jsx';
import { PAYMENT_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '../../properties/constants.js';
import { useApprovePropertyMutation, useGetPendingPropertiesQuery } from '../adminApi.js';
import { AdminShell } from '../components/AdminShell.jsx';
import { RejectPropertyDialog } from '../components/RejectPropertyDialog.jsx';

const text = ar.admin;
const PAGE_SIZE = 10;

/** `?page=` as a whole number from 1. */
function readPage(searchParams) {
  const page = Math.floor(Number(searchParams.get('page')));
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

/**
 * Figma "طابور الموافقات — أدمن" (80:753): title and count, then one "صف جدول / Table Row"
 * (47:807) per listing — photo 48, title — city, price, a badge, the wait, «موافقة» / «رفض» and
 * ⋮. The queue item has no seller, image count, document or land class in the API: the second
 * line shows the area and payment, the badge the property type. Oldest first, 10 per page.
 */
export default function PendingPropertiesPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  const { data, isLoading, isFetching, error, refetch } = useGetPendingPropertiesQuery({
    page,
    pageSize: PAGE_SIZE,
  });
  const [approveProperty] = useApprovePropertyMutation();
  const [approvingId, setApprovingId] = useState(null);
  const [propertyToReject, setPropertyToReject] = useState(null);

  function changePage(nextPage) {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set('page', String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 0 });
  }

  async function handleApprove(property) {
    setApprovingId(property.id);
    try {
      await approveProperty(property.id).unwrap();
      toast.show({ tone: 'success', message: text.approved(property.title) });
    } catch (approveError) {
      toast.show({ tone: 'error', message: actionErrorMessage(approveError) });
    } finally {
      setApprovingId(null);
    }
  }

  let content;
  if (isLoading) {
    content = <Skeleton className="h-[380px] rounded-lg" />;
  } else if (error) {
    const problem = toProblem(error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    content = <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />;
  } else if (data.items.length === 0 && page > 1) {
    // The last item of a later page was decided: go back one page.
    content = (
      <EmptyState
        title={text.queueEmptyTitle}
        action={{ label: text.backToQueue, onClick: () => changePage(page - 1) }}
      />
    );
  } else if (data.items.length === 0) {
    content = <EmptyState title={text.queueEmptyTitle} description={text.queueEmptyText} />;
  } else {
    content = (
      <>
        <ul
          aria-busy={isFetching || undefined}
          className="divide-y divide-border overflow-visible rounded-lg border border-border bg-raised"
        >
          {data.items.map((property) => {
            let details = PAYMENT_TYPE_LABELS[property.paymentType];
            if (property.region) details = `${property.region} · ${details}`;
            return (
              <li
                key={property.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 px-[17px] py-[13px] xl:flex-nowrap"
              >
                <div className="flex min-w-0 basis-full items-center gap-4 xl:flex-1 xl:basis-auto">
                  <span className="size-12 shrink-0 overflow-hidden rounded-[10px]">
                    <PropertyPhoto src={property.mainImageUrl} />
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Link
                      to={`/admin/properties/${property.id}`}
                      className="truncate rounded-sm text-[14px] leading-[1.75] font-semibold text-text hover:text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      {`${property.title} — ${property.city}`}
                    </Link>
                    <p className="truncate text-[11.5px] leading-[1.75] text-muted">{details}</p>
                  </div>
                </div>
                {/* Fixed widths on desktop keep price, type and wait in straight columns. */}
                <span
                  dir="ltr"
                  className="text-[13.5px] leading-[1.75] font-semibold whitespace-nowrap text-text xl:w-[130px] xl:text-end"
                >
                  {formatPrice(property.price)}
                </span>
                <span className="xl:w-[80px]">
                  <Badge tone="neutral">{PROPERTY_TYPE_LABELS[property.propertyType]}</Badge>
                </span>
                <span className="text-[12.5px] leading-[1.75] whitespace-nowrap text-muted xl:w-[110px]">
                  {formatRelativeTime(property.createdAtUtc)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(property)}
                    disabled={approvingId !== null}
                    aria-busy={approvingId === property.id || undefined}
                    className="rounded-[10px] bg-brand px-3.5 py-[7px] text-[12.5px] leading-[1.75] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
                  >
                    {text.approve}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyToReject(property)}
                    disabled={approvingId !== null}
                    className="rounded-[10px] bg-danger-soft px-3.5 py-[7px] text-[12.5px] leading-[1.75] font-semibold text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
                  >
                    {text.reject}
                  </button>
                  <RowActionsMenu
                    label={text.rowActions(property.title)}
                    items={[{ label: text.openReview, to: `/admin/properties/${property.id}` }]}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <Pagination page={data.pageNumber} totalPages={data.totalPages} onPageChange={changePage} />
      </>
    );
  }

  return (
    <AdminShell pendingCount={data?.totalCount}>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[22px] leading-[1.72] font-bold text-text xl:text-[25px]">
          {text.queueTitle}
        </h1>
        {data && (
          <p className="text-[13.5px] leading-[1.72] text-text-secondary">
            {text.queueSubtitle(formatNumber(data.totalCount))}
          </p>
        )}
      </div>
      {content}
      <RejectPropertyDialog
        property={propertyToReject}
        onClose={() => setPropertyToReject(null)}
        onRejected={() => setPropertyToReject(null)}
      />
    </AdminShell>
  );
}
