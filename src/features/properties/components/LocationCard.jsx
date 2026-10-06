import { useState } from 'react';
import { IconMapPin } from '../../../components/icons/index.js';
import { GoogleMap } from '../../../lib/maps/GoogleMap.jsx';
import { hasMapKey } from '../../../lib/maps/googleMaps.js';
import { ar } from '../../../locales/ar.js';

// Close enough to see the streets around the listing.
const DETAILS_ZOOM = 14;
const DESKTOP_QUERY = '(min-width: 1280px)';

/** True on a desktop-wide window (read once; the button covers a later resize). */
function isDesktopWidth() {
  return typeof window !== 'undefined' && window.matchMedia?.(DESKTOP_QUERY).matches === true;
}

/**
 * Figma "الموقع على الخريطة" (67:1177): the 300px map area (bg/inset, radius 14). A Google map
 * with one fixed marker at the listing (the project guide 10.3). On phones the map waits behind
 * «عرض على الخريطة» (not in Figma), so the library is only downloaded when wanted. Without a
 * key, or when Google can't load, the static card with the brand pin and the place name. The
 * "nearby" row is not in the API.
 *
 * @param {{ place: string, latitude: number, longitude: number }} props
 */
export function LocationCard({ place, latitude, longitude }) {
  const [isMapOpen, setIsMapOpen] = useState(isDesktopWidth);
  const point = { lat: latitude, lng: longitude };
  const canShowMap = hasMapKey();

  const staticCard = (
    <div className="flex h-[300px] flex-col items-center justify-center gap-2 rounded-[14px] bg-inset px-4">
      <span className="rounded-full bg-brand p-3 text-inverse">
        <IconMapPin />
      </span>
      <p className="text-center text-[13px] leading-[1.78] font-semibold text-text-secondary">
        {place}
      </p>
      {canShowMap && !isMapOpen && (
        <button
          type="button"
          onClick={() => setIsMapOpen(true)}
          className="mt-1 rounded-md bg-brand px-4 py-2 text-[13.5px] leading-[1.72] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {ar.property.showMap}
        </button>
      )}
    </div>
  );

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-raised p-[23px]">
      <h2 className="text-[19px] leading-[1.78] font-bold text-text">{ar.property.mapTitle}</h2>
      {(!canShowMap || !isMapOpen) && staticCard}
      {canShowMap && isMapOpen && (
        <GoogleMap
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
