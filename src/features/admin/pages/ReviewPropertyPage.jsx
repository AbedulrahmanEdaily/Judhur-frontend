import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import clsx from 'clsx';
import { IconCheckSmall13, IconReject17, IconStepCheck } from '../../../components/icons/index.js';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { formatArea, formatPrice, formatRelativeTime } from '../../../lib/format.js';
import { actionErrorMessage, toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { LocationCard } from '../../properties/components/LocationCard.jsx';
import {
  LAND_CLASSIFICATION_LABELS,
  LEGAL_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from '../../properties/constants.js';
import { useApprovePropertyMutation, useGetReviewPropertyQuery } from '../adminApi.js';
import { RejectPropertyDialog } from '../components/RejectPropertyDialog.jsx';
import { ReviewDocumentCard } from '../components/ReviewDocumentCard.jsx';

const text = ar.admin;
const cardClasses = 'rounded-lg border border-border bg-raised px-5 py-5 xl:px-6 xl:py-[22px]';
const NO_CHECKS = text.checklist.map(() => false);

// The signed link lives 10 minutes. It is renewed 9.5 minutes after the response arrived,
// counted on this browser's clock only (the server's expiry time may be off from it).
const LINK_RENEW_AFTER_MS = 9.5 * 60 * 1000;
const MIN_RENEW_DELAY_MS = 30 * 1000;

/** Milliseconds until the document link is renewed: from when the response arrived, ≥ 30 s. */
function msUntilRenew(fulfilledAt) {
  return Math.max(MIN_RENEW_DELAY_MS, fulfilledAt + LINK_RENEW_AFTER_MS - Date.now());
}

/**
 * Figma "مراجعة عقار — أدمن" (81:751): the header with «راجعه لاحقاً», the document card, the
 * data as the owner entered it, then the review checklist, the decision buttons and the owner.
 * The checklist is the admin's own aid (the API does not store it). Figma's «اطلب تعديل من
 * المالك», the automatic class warning, the listing number, the queue position and the owner's
 * stats have no API and are left out; the map and the extra facts are not in Figma.
 */
export default function ReviewPropertyPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    data: property,
    isLoading,
    isFetching,
    error,
    refetch,
    fulfilledTimeStamp,
  } = useGetReviewPropertyQuery(propertyId, { refetchOnMountOrArgChange: true });
  const [approveProperty, { isLoading: isApproving }] = useApprovePropertyMutation();
  const [checks, setChecks] = useState(NO_CHECKS);
  const [propertyToReject, setPropertyToReject] = useState(null);

  // The document link must never be used after it expires: fetch a new one just before.
  const hasDocumentLink = Boolean(property?.ownershipDocumentUrl);
  useEffect(() => {
    if (!hasDocumentLink || !fulfilledTimeStamp) return undefined;
    const timer = setTimeout(refetch, msUntilRenew(fulfilledTimeStamp));
    return () => clearTimeout(timer);
  }, [hasDocumentLink, fulfilledTimeStamp, refetch]);

  async function handleApprove() {
    try {
      await approveProperty(property.id).unwrap();
      toast.show({ tone: 'success', message: text.approved(property.title) });
      navigate('/admin/properties');
    } catch (approveError) {
      toast.show({ tone: 'error', message: actionErrorMessage(approveError) });
      refetch();
    }
  }

  function toggleCheck(index) {
    const next = [...checks];
    next[index] = !next[index];
    setChecks(next);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 bg-surface px-4 py-6 xl:px-[70px]">
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-[420px] rounded-lg" />
      </div>
    );
  }

  if (error) {
    const problem = toProblem(error);
    let content;
    if (problem.status === 404) {
      content = (
        <EmptyState
          title={text.notFoundTitle}
          description={text.notFoundText}
          action={{ label: text.backToQueue, to: '/admin/properties' }}
        />
      );
    } else {
      let requestId;
      if (problem.status >= 500) requestId = problem.requestId;
      content = <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />;
    }
    return <div className="bg-surface px-4 py-6 xl:px-[70px] xl:py-10">{content}</div>;
  }

  const isPending = property.moderationStatus === 'Pending';
  const sentAt = formatRelativeTime(property.createdAtUtc);
  let subtitle = text.reviewSubtitleNoSeller(sentAt);
  if (property.seller) subtitle = text.reviewSubtitle(property.seller.fullName, sentAt);

  let place = property.city;
  if (property.region) place = `${property.city} — ${property.region}`;

  const mainFacts = [
    { label: text.facts.price, value: formatPrice(property.price), isPrice: true },
    { label: text.facts.area, value: formatArea(property.area) },
    {
      label: text.facts.landClassification,
      value: LAND_CLASSIFICATION_LABELS[property.landClassification],
    },
    { label: text.facts.document, value: LEGAL_STATUS_LABELS[property.legalStatus] },
  ];
  const moreFacts = [
    { label: text.moreFacts.type, value: PROPERTY_TYPE_LABELS[property.propertyType] },
    { label: text.moreFacts.purpose, value: PROPERTY_STATUS_LABELS[property.propertyStatus] },
    { label: text.moreFacts.payment, value: PAYMENT_TYPE_LABELS[property.paymentType] },
    { label: text.moreFacts.place, value: place },
  ];

  return (
    <div className="min-h-full bg-surface">
      {/* Header (81:834). */}
      <div className="flex flex-wrap items-center gap-3 bg-bg px-4 pt-6 pb-[18px] xl:px-[70px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <h1 className="text-[20px] leading-[1.74] font-bold text-text xl:text-[24px]">
            {text.reviewTitle(property.title)}
          </h1>
          <p className="text-[13px] leading-[1.74] text-text-secondary">{subtitle}</p>
        </div>
        <Link
          to="/admin/properties"
          className="rounded-md border border-border-strong bg-surface px-[17px] py-[9px] text-[13.5px] leading-[1.74] font-semibold text-text transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {text.reviewLater}
        </Link>
      </div>

      <div className="flex flex-col gap-6 px-4 pt-6 pb-10 xl:flex-row xl:items-start xl:px-[70px] xl:pb-[60px]">
        {/* The side column (81:842) — first in the DOM, so it sits at the start (right). */}
        <aside className="flex flex-col gap-[18px] xl:w-[400px] xl:shrink-0">
          <section className={clsx(cardClasses, 'flex flex-col gap-4')}>
            <h2 className="text-[17px] leading-[1.74] font-bold text-text">
              {text.checklistTitle}
            </h2>
            {text.checklist.map((item, index) => (
              <label key={item} className="flex cursor-pointer items-center gap-2.5">
                <span className="relative inline-flex size-5 shrink-0">
                  <input
                    type="checkbox"
                    checked={checks[index]}
                    onChange={() => toggleCheck(index)}
                    className="peer absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-[6px] border-[1.5px] border-border-strong bg-bg checked:border-brand checked:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  />
                  <IconCheckSmall13 className="pointer-events-none absolute inset-0 m-auto hidden text-inverse peer-checked:block" />
                </span>
                <span className="text-[13.5px] leading-[1.74] text-text-secondary">{item}</span>
              </label>
            ))}
          </section>

          <section className={clsx(cardClasses, 'flex flex-col gap-4')}>
            {isPending && (
              <>
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isApproving}
                    aria-busy={isApproving || undefined}
                    className="flex items-center justify-center gap-[9px] rounded-md bg-brand py-3.5 text-[14.5px] leading-[1.74] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
                  >
                    {text.approvePublish}
                    <IconStepCheck />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyToReject(property)}
                    disabled={isApproving}
                    className="flex items-center justify-center gap-[9px] rounded-md bg-danger-soft py-3.5 text-[14.5px] leading-[1.74] font-semibold text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
                  >
                    {text.rejectWithReason}
                    <IconReject17 />
                  </button>
                </div>
                <p className="text-[12px] leading-[1.74] text-muted">{text.decisionHint}</p>
              </>
            )}
            {property.moderationStatus === 'Approved' && (
              <p className="rounded-md bg-success-soft px-3.5 py-2.5 text-[14px] leading-[1.74] font-semibold text-success">
                {text.decidedApproved}
              </p>
            )}
            {property.moderationStatus === 'Rejected' && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[14px] leading-[1.74] font-semibold text-danger">
                  {text.decidedRejected}
                </p>
                {property.rejectionReason && (
                  <p className="text-[13px] leading-[1.74] text-text-secondary">
                    {text.rejectionReason(property.rejectionReason)}
                  </p>
                )}
              </div>
            )}
          </section>

          <section className={clsx(cardClasses, 'flex flex-col gap-4')}>
            <h2 className="text-[17px] leading-[1.74] font-bold text-text">{text.ownerTitle}</h2>
            {property.seller && (
              <div className="flex items-center gap-3">
                <Avatar
                  name={property.seller.fullName}
                  imageUrl={property.seller.profileImageUrl}
                />
                <div className="flex min-w-0 flex-col gap-px">
                  <p className="text-[15px] leading-[1.74] font-semibold text-text">
                    {property.seller.fullName}
                  </p>
                  {property.seller.phoneNumber && (
                    <p dir="ltr" className="self-start text-[12px] leading-[1.74] text-muted">
                      {property.seller.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            )}
            {!property.seller && (
              <p className="text-[13px] leading-[1.74] text-text-secondary">{text.sellerGone}</p>
            )}
          </section>
        </aside>

        {/* The main column (81:843). */}
        <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
          <ReviewDocumentCard
            legalStatus={LEGAL_STATUS_LABELS[property.legalStatus]}
            documentUrl={property.ownershipDocumentUrl}
            isRefreshing={isFetching}
          />

          <section className={clsx(cardClasses, 'flex flex-col gap-4')}>
            <h2 className="text-[17px] leading-[1.74] font-bold text-text">{text.dataTitle}</h2>
            {[mainFacts, moreFacts].map((facts) => (
              <dl
                key={facts[0].label}
                className="grid grid-cols-2 gap-y-3 sm:grid-cols-4 sm:divide-x sm:divide-border sm:divide-x-reverse"
              >
                {facts.map((fact) => (
                  <div key={fact.label} className="flex flex-col gap-px sm:px-4 sm:first:ps-0">
                    <dt className="text-[12px] leading-[1.74] text-muted">{fact.label}</dt>
                    <dd
                      dir={fact.isPrice ? 'ltr' : undefined}
                      className={clsx(
                        'text-[15px] leading-[1.74] font-bold text-text',
                        fact.isPrice && 'self-start',
                      )}
                    >
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ))}
            <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
              {property.images.map((image, index) => (
                <li key={image.id}>
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={text.showImage(index + 1)}
                    className="block h-[78px] overflow-hidden rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <img src={image.url} alt="" loading="lazy" className="size-full object-cover" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-[13.5px] leading-[1.74] whitespace-pre-line text-text-secondary">
              {property.description || text.noDescription}
            </p>
            <p className="text-[13px] leading-[1.74] text-text-secondary">
              <span className="font-semibold text-text">{text.fullAddress}: </span>
              {property.fullAddress}
            </p>
          </section>

          <LocationCard place={place} latitude={property.latitude} longitude={property.longitude} />
        </div>
      </div>

      <RejectPropertyDialog
        property={propertyToReject}
        onClose={() => setPropertyToReject(null)}
        onRejected={() => navigate('/admin/properties')}
      />
    </div>
  );
}
