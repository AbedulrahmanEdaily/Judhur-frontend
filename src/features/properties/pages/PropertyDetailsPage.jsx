import { Link, useNavigate, useParams } from 'react-router';
import { IconPin } from '../../../components/icons/index.js';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { formatArea } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { DescriptionCard } from '../components/DescriptionCard.jsx';
import { KeyFacts } from '../components/KeyFacts.jsx';
import { LegalStatusCard } from '../components/LegalStatusCard.jsx';
import { ListingBadges } from '../components/ListingBadges.jsx';
import { LocationCard } from '../components/LocationCard.jsx';
import { MobileContactBar } from '../components/MobileContactBar.jsx';
import { PriceCard } from '../components/PriceCard.jsx';
import { PropertyDetailsSkeleton } from '../components/PropertyDetailsSkeleton.jsx';
import { PropertyGallery } from '../components/PropertyGallery.jsx';
import { SafetyTips } from '../components/SafetyTips.jsx';
import { ShareButton } from '../components/ShareButton.jsx';
import { PROPERTY_TYPE_PLURALS } from '../constants.js';
import { useGetPropertyByIdQuery } from '../propertiesApi.js';
import { searchPath } from '../searchFilters.js';

const text = ar.property;

/** "نابلس — رفيديا، شارع الأمير" */
function fullPlace(property) {
  let place = property.city;
  if (property.region) place = `${place} — ${property.region}`;
  return `${place}، ${property.fullAddress}`;
}

/**
 * Figma "تفاصيل العقار — زائر" (65:1087) from 1280px up, "تفاصيل العقار — موبايل" (83:671) below.
 * Guests get the page too; the seller phone comes only for signed-in users.
 */
export default function PropertyDetailsPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { currentData: property, isFetching, error, refetch } = useGetPropertyByIdQuery(propertyId);

  function goBack() {
    // Back to the results the user came from; straight to the search on a direct visit.
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/properties');
  }

  if (isFetching && !property) return <PropertyDetailsSkeleton />;

  if (error) {
    const problem = toProblem(error);
    if (problem.status === 404) {
      return (
        <div className="p-4 xl:px-20 xl:py-[60px]">
          <EmptyState
            title={text.notFoundTitle}
            description={text.notFoundText}
            action={{ label: text.backToSearch, to: '/properties' }}
          />
        </div>
      );
    }
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    return (
      <div className="p-4 xl:px-20 xl:py-[60px]">
        <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />
      </div>
    );
  }

  if (!property) return null;

  const place = property.region ? `${property.city} — ${property.region}` : property.city;

  return (
    <div className="flex flex-col bg-bg pb-[88px] xl:bg-surface xl:pb-0">
      {/* Title block (65:1157); on mobile the badges come first (83:685). */}
      <section className="flex flex-col gap-3.5 bg-bg px-4 pt-4 xl:px-20 xl:pt-[26px] xl:pb-[22px]">
        <nav aria-label={ar.common.breadcrumb} className="hidden xl:block">
          <ol className="flex items-center gap-2 text-[12.5px] leading-[1.72] text-muted">
            <li>
              <Link to="/" className="text-brand-text">
                {ar.nav.home}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                to={searchPath({ propertyType: property.propertyType })}
                className="text-brand-text"
              >
                {PROPERTY_TYPE_PLURALS[property.propertyType]}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>{property.city}</li>
            <li aria-hidden="true">/</li>
            <li className="max-w-[240px] truncate">{property.title}</li>
          </ol>
        </nav>

        <div className="flex items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3.5 xl:gap-2">
            <h1 className="text-[19px] leading-[1.72] font-bold text-text xl:text-[28px]">
              {`${property.title} — ${formatArea(property.area)}`}
            </h1>
            <p className="flex items-center gap-[5px] text-[13px] leading-[1.72] text-text-secondary xl:gap-1.5 xl:text-[13.5px]">
              <IconPin className="shrink-0 text-muted" />
              {fullPlace(property)}
            </p>
            <ListingBadges
              propertyStatus={property.propertyStatus}
              landClassification={property.landClassification}
              className="order-first gap-1.5 xl:order-none xl:gap-2"
            />
          </div>
          <div className="hidden xl:block">
            <ShareButton title={property.title} />
          </div>
        </div>
      </section>

      <PropertyGallery images={property.images} title={property.title} onBack={goBack} />

      <div className="flex flex-col gap-3.5 px-4 pt-3.5 pb-4 xl:flex-row xl:items-start xl:gap-[26px] xl:px-20 xl:pt-2 xl:pb-[60px]">
        <aside className="order-last flex flex-col gap-3.5 xl:order-none xl:w-[360px] xl:shrink-0 xl:gap-[18px]">
          <PriceCard property={property} />
          <SafetyTips />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-3.5 xl:gap-5">
          <KeyFacts property={property} />
          <div className="order-first xl:order-none">
            <LegalStatusCard
              landClassification={property.landClassification}
              legalStatus={property.legalStatus}
            />
          </div>
          {property.description && <DescriptionCard description={property.description} />}
          <LocationCard place={place} />
        </div>
      </div>

      <MobileContactBar property={property} />
    </div>
  );
}
