import { Link } from 'react-router';
import { IconPin } from '../../../components/icons/index.js';
import { formatArea, formatPrice } from '../../../lib/format.js';
import { FavoriteButton } from '../../favorites/components/FavoriteButton.jsx';
import { PROPERTY_STATUS_LABELS } from '../constants.js';
import { ListingBadges } from './ListingBadges.jsx';
import { PropertyPhoto } from './PropertyPhoto.jsx';

/** "نابلس — رفيديا", or just the city. */
function placeText(property) {
  if (property.region) return `${property.city} — ${property.region}`;
  return property.city;
}

/**
 * Figma "بطاقة عقار / Property Card" (33:2) from 1280px up, and the mobile card (83:547) below.
 * Only the API's data is shown: no photo count, frontage, street, AI estimate, or seller row —
 * the search summary has none of them. The heart (33:4) sits on the photo at the end; it is a
 * sibling of the card link (a button can't live inside a link).
 * Sold / rented listings get a pill in the photo-count slot. The title is fixed at two lines
 * (not in Figma, where every sample title fits one).
 *
 * @param {{ property: import('../../../api/types.js').PropertySummary }} props
 */
export function PropertyCard({ property }) {
  const isClosed = property.propertyStatus === 'Sold' || property.propertyStatus === 'Rented';

  return (
    <div className="relative">
      <Link
        to={`/properties/${property.id}`}
        className="flex flex-col overflow-hidden rounded-lg border border-border bg-raised transition-shadow hover:shadow-menu focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <div className="relative h-[150px] shrink-0 overflow-hidden xl:h-[186px]">
          <PropertyPhoto src={property.mainImageUrl} alt={property.title} />
          {isClosed && (
            <span className="absolute start-3 top-3 rounded-full bg-black/45 px-3 py-1.5 text-[11px] leading-[1.7] font-semibold text-white">
              {PROPERTY_STATUS_LABELS[property.propertyStatus]}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 px-3.5 pt-3 pb-3.5 xl:gap-3 xl:p-4">
          <ListingBadges propertyStatus={property.propertyStatus} className="gap-1.5 xl:gap-2" />

          {/* Always two lines tall, so the cards line up; a longer title ends with "…". */}
          <h3
            title={property.title}
            className="line-clamp-2 min-h-[2lh] text-[15px] leading-[1.72] font-bold text-text xl:text-[18px] xl:leading-[1.7]"
          >
            {property.title}
          </h3>

          {/* Mobile: one muted line "city — region · area". */}
          <p className="text-[12px] leading-[1.72] whitespace-pre-wrap text-muted xl:hidden">
            {`${placeText(property)}  ·  ${formatArea(property.area)}`}
          </p>

          {/* Desktop: the place with its pin, then the area. */}
          <p className="hidden items-center gap-1.5 text-[13px] leading-[1.7] text-text-secondary xl:flex">
            <IconPin className="shrink-0 text-muted" />
            {placeText(property)}
          </p>
          <p className="hidden text-[12.5px] leading-[1.7] text-muted xl:block">
            {formatArea(property.area)}
          </p>
          <div className="hidden h-px bg-border xl:block" />

          {/* Figma sets prices left to right: "45,000 ₪". */}
          <p
            dir="ltr"
            className="self-start text-[18px] leading-[1.72] font-bold whitespace-nowrap text-brand-text xl:text-[21px] xl:leading-[1.7]"
          >
            {formatPrice(property.price)}
          </p>
        </div>
      </Link>
      <FavoriteButton
        propertyId={property.id}
        title={property.title}
        className="absolute end-3 top-3"
      />
    </div>
  );
}
