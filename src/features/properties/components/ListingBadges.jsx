import clsx from 'clsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { VerifiedBadge } from '../../../components/ui/VerifiedBadge.jsx';
import {
  LAND_CLASSIFICATION_BADGES,
  LAND_CLASSIFICATION_TONES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_TONES,
} from '../constants.js';

/**
 * The badge row of a listing, in the Figma order (RTL): land class, status, «موثّق».
 * Every public listing is approved, so «موثّق» always shows. Search results have no land
 * class, so it shows only when given.
 *
 * @param {{
 *   propertyStatus: import('../../../api/types.js').PropertyStatus,
 *   landClassification?: import('../../../api/types.js').LandClassification,
 *   className?: string,
 * }} props
 */
export function ListingBadges({ propertyStatus, landClassification, className }) {
  return (
    <div className={clsx('flex flex-wrap items-start', className)}>
      {landClassification && (
        <Badge tone={LAND_CLASSIFICATION_TONES[landClassification]}>
          {LAND_CLASSIFICATION_BADGES[landClassification]}
        </Badge>
      )}
      <Badge tone={PROPERTY_STATUS_TONES[propertyStatus]}>
        {PROPERTY_STATUS_LABELS[propertyStatus]}
      </Badge>
      <VerifiedBadge />
    </div>
  );
}
