import { Link, useParams } from 'react-router';
import { AccountShell } from '../../../components/layout/AccountShell.jsx';
import { PageTopBar } from '../../../components/layout/PageTopBar.jsx';
import { IconBackChevron } from '../../../components/icons/index.js';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { formatDate, formatPrice } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { DocumentUploader } from '../components/DocumentUploader.jsx';
import { ImagesManager } from '../components/ImagesManager.jsx';
import { ListingSummary } from '../components/ListingSummary.jsx';
import { OwnerActions } from '../components/OwnerActions.jsx';
import { OwnerLoadError } from '../components/OwnerLoadError.jsx';
import { ReadinessChecklist } from '../components/ReadinessChecklist.jsx';
import {
  OWNER_STATE_LABELS,
  OWNER_STATE_TONES,
  ownerStateOf,
  readinessOf,
} from '../listingState.js';
import { useGetMyPropertiesQuery, useGetMyPropertyQuery } from '../propertiesApi.js';

const text = ar.ownerProperty;

/**
 * The owner's page of one listing, in every moderation state (not in Figma — built from the
 * «عقاراتي» frame, tokens and the design-system parts): state badge, the rejection reason, the
 * readiness checklist (Pending / Rejected), the actions of CLAUDE.md 6.8, the images, the
 * document and the saved data.
 */
export default function MyPropertyPage() {
  const { propertyId } = useParams();
  const { data: property, isLoading, error, refetch } = useGetMyPropertyQuery(propertyId);
  const { data: myProperties } = useGetMyPropertiesQuery();

  let content;
  if (isLoading) {
    content = <Skeleton className="h-[480px] rounded-lg" />;
  } else if (error) {
    content = <OwnerLoadError error={error} onRetry={refetch} />;
  } else {
    const state = ownerStateOf(property);
    const readiness = readinessOf(property);
    const isSoldOrRented = state === 'sold' || state === 'rented';
    const showChecklist = state === 'pending' || state === 'rejected';

    let place = property.city;
    if (property.region) place = `${property.city} — ${property.region}`;

    content = (
      <>
        <section className="flex flex-col gap-2 rounded-lg border border-border bg-raised p-4 xl:px-[21px] xl:py-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="min-w-0 flex-1 text-[20px] leading-[1.6] font-bold text-text xl:text-[24px]">
              {property.title}
            </h1>
            <Badge tone={OWNER_STATE_TONES[state]}>{OWNER_STATE_LABELS[state]}</Badge>
          </div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] leading-[1.72] text-text-secondary">
            <span>{place}</span>
            <span aria-hidden="true">·</span>
            <span dir="ltr" className="font-bold text-brand-text">
              {formatPrice(property.price)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{text.added(formatDate(property.createdAtUtc))}</span>
          </p>
        </section>

        {state === 'rejected' && (
          <div
            role="alert"
            className="flex flex-col gap-1 rounded-lg bg-danger-soft px-[18px] py-4"
          >
            <p className="text-[14px] leading-[1.72] font-bold text-danger">{text.rejectedTitle}</p>
            {property.rejectionReason && (
              <p className="text-[14px] leading-[1.72] text-text">{property.rejectionReason}</p>
            )}
            <p className="text-[13px] leading-[1.72] text-text-secondary">{text.rejectedHint}</p>
          </div>
        )}
        {!property.isActive && (
          <p className="rounded-lg bg-inset px-[18px] py-3.5 text-[13.5px] leading-[1.72] font-semibold text-text-secondary">
            {text.inactiveNote}
          </p>
        )}
        {isSoldOrRented && (
          <p className="rounded-lg bg-inset px-[18px] py-3.5 text-[13.5px] leading-[1.72] font-semibold text-text-secondary">
            {text.soldNote}
          </p>
        )}

        {showChecklist && (
          <ReadinessChecklist readiness={readiness} isPending={state === 'pending'} />
        )}
        <OwnerActions property={property} state={state} />

        {!isSoldOrRented && <ImagesManager propertyId={property.id} images={property.images} />}
        {!isSoldOrRented && (
          <DocumentUploader
            propertyId={property.id}
            hasDocument={property.hasOwnershipDocument}
            confirmReplace={state === 'published' || state === 'paused'}
          />
        )}
        <ListingSummary property={property} title={text.detailsTitle} subtitle="" />
      </>
    );
  }

  return (
    <>
      <PageTopBar title={ar.myProperties.title} backTo="/my-properties" />
      <AccountShell listingsCount={myProperties?.length}>
        <Link
          to="/my-properties"
          className="hidden items-center gap-1 self-start rounded-sm text-[13px] leading-[1.72] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand xl:flex"
        >
          <IconBackChevron className="size-4" />
          {text.backToList}
        </Link>
        {content}
      </AccountShell>
    </>
  );
}
