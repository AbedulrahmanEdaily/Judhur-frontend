import { Link } from 'react-router';
import clsx from 'clsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { formatArea, formatPrice } from '../../../lib/format.js';
import { PropertyPhoto } from '../../properties/components/PropertyPhoto.jsx';
import {
  LAND_CLASSIFICATION_BADGES,
  LAND_CLASSIFICATION_TONES,
} from '../../properties/constants.js';

/**
 * Figma map list row (71:1423): 20×14, 14 gap; the title 14.5 semibold, «المنطقة · المساحة» 12
 * muted, then the price 16 bold brand with the land class badge; the 84×66 photo (radius 11) at
 * the end. The chosen row (its pin is tapped, or the pointer is on it) sits on brand/subtle.
 * The row opens the listing.
 *
 * @param {{
 *   property: import('../../../api/types.js').PropertySummary,
 *   landClassification?: import('../../../api/types.js').LandClassification,
 *   isActive: boolean,
 *   onHover: (id: string | null) => void,
 * }} props
 */
export function MapListingRow({ property, landClassification, isActive, onHover }) {
  let place = property.city;
  if (property.region) place = property.region;

  return (
    <Link
      to={`/properties/${property.id}`}
      data-listing-id={property.id}
      onPointerEnter={() => onHover(property.id)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(property.id)}
      onBlur={() => onHover(null)}
      aria-current={isActive ? 'true' : undefined}
      className={clsx(
        'flex items-center gap-[14px] px-5 py-[14px] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand',
        isActive ? 'bg-brand-subtle' : 'bg-surface hover:bg-inset',
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-[5px] leading-[1.7]">
        <span className="truncate text-[14.5px] font-semibold text-text">{property.title}</span>
        <span className="text-[12px] whitespace-pre-wrap text-muted">
          {`${place}  ·  ${formatArea(property.area)}`}
        </span>
        <span className="flex items-center gap-2">
          <span dir="ltr" className="text-[16px] font-bold text-brand-text">
            {formatPrice(property.price)}
          </span>
          {landClassification && (
            <Badge tone={LAND_CLASSIFICATION_TONES[landClassification]}>
              {LAND_CLASSIFICATION_BADGES[landClassification]}
            </Badge>
          )}
        </span>
      </span>
      <span className="h-[66px] w-[84px] shrink-0 overflow-hidden rounded-[11px]">
        <PropertyPhoto src={property.mainImageUrl} placeholder="noon" />
      </span>
    </Link>
  );
}
