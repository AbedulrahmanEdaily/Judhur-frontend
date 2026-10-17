import { Badge } from '../../../components/ui/Badge.jsx';
import { OWNER_STATE_LABELS, OWNER_STATE_TONES, ownerStateOf } from '../listingState.js';

/** @param {{ property: { propertyStatus: string, moderationStatus: string, isActive: boolean } }} props */
export function OwnerStateBadges({ property }) {
  const state = ownerStateOf(property);
  const showsPaused = !property.isActive && state !== 'paused';

  return (
    <span className="inline-flex shrink-0 flex-wrap items-center gap-1.5">
      <Badge tone={OWNER_STATE_TONES[state]}>{OWNER_STATE_LABELS[state]}</Badge>
      {showsPaused && <Badge tone={OWNER_STATE_TONES.paused}>{OWNER_STATE_LABELS.paused}</Badge>}
    </span>
  );
}
