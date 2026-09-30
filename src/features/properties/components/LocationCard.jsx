import { IconMapPin } from '../../../components/icons/index.js';
import { HereMap } from '../../../lib/maps/HereMap.jsx';
import { hasMapKey } from '../../../lib/maps/platform.js';
import { ar } from '../../../locales/ar.js';

// Close enough to see the streets around the listing.
const DETAILS_ZOOM = 14;

/**
 * Figma "الموقع على الخريطة" (67:1177): the 300px map area (bg/inset, radius 14). A HERE map
 * with one fixed marker at the listing (CLAUDE.md 10.3); without a key, or when HERE can't load,
 * the static card with the brand pin and the place name. The "nearby" row is not in the API.
 *
 * @param {{ place: string, latitude: number, longitude: number }} props
 */
export function LocationCard({ place, latitude, longitude }) {
  const point = { lat: latitude, lng: longitude };
  const staticCard = (
    <div className="flex h-[300px] flex-col items-center justify-center gap-2 rounded-[14px] bg-inset">
      <span className="rounded-full bg-brand p-3 text-inverse">
        <IconMapPin />
      </span>
      <p className="text-center text-[13px] leading-[1.78] font-semibold text-text-secondary">
        {place}
      </p>
    </div>
  );

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-raised p-[23px]">
      <h2 className="text-[19px] leading-[1.78] font-bold text-text">{ar.property.mapTitle}</h2>
      {!hasMapKey() && staticCard}
      {hasMapKey() && (
        <HereMap
          center={point}
          zoom={DETAILS_ZOOM}
          marker={point}
          label={`${ar.property.mapTitle}: ${place}`}
          className="h-[300px] overflow-hidden rounded-[14px] bg-inset"
          fallback={staticCard}
        />
      )}
    </section>
  );
}
