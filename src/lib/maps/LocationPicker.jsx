import { useState } from 'react';
import { ar } from '../../locales/ar.js';
import { searchPlace } from './geocoding.js';
import { HereMap } from './HereMap.jsx';
import { DEFAULT_CENTER, DEFAULT_ZOOM, hasMapKey } from './platform.js';

const text = ar.listing;

// Close enough to see the street once a point exists.
const POINT_ZOOM = 15;

/**
 * Figma "حدد الموقع" (91:1980): the 200px map box (bg/inset, radius 14). A tap on the map
 * reports the point; a search box above moves the map (not in Figma). Without a map (no key,
 * or HERE can't load) the box says so and the coordinates are typed in the fields under it.
 *
 * @param {{
 *   latitude: number | null,
 *   longitude: number | null,
 *   onPick: (point: { latitude: number, longitude: number }) => void,
 * }} props
 */
export function LocationPicker({ latitude, longitude, onPick }) {
  let marker = null;
  if (latitude !== null && longitude !== null) marker = { lat: latitude, lng: longitude };

  const [view, setView] = useState(() => {
    if (marker) return { center: marker, zoom: POINT_ZOOM };
    return { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };
  });
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const unavailable = (
    <div className="flex h-[200px] items-center justify-center rounded-[14px] bg-inset px-6 text-center text-[13.5px] leading-[1.72] font-semibold text-muted">
      {text.mapUnavailable}
    </div>
  );
  if (!hasMapKey()) return unavailable;

  async function runSearch() {
    const place = query.trim();
    if (!place) return;
    setIsSearching(true);
    setNotFound(false);
    const result = await searchPlace(place);
    setIsSearching(false);
    if (!result) {
      setNotFound(true);
      return;
    }
    setView({ center: result, zoom: POINT_ZOOM });
  }

  // Inside the listing <form>: Enter searches instead of submitting the step.
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      runSearch();
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={text.mapSearchLabel}
          placeholder={text.mapSearchLabel}
          className="min-w-0 flex-1 rounded-md border border-border-strong bg-bg px-[13px] py-2 text-[13.5px] leading-[1.72] text-text outline-none placeholder:text-muted focus:border-brand focus:ring-1 focus:ring-brand focus:ring-inset"
        />
        <button
          type="button"
          onClick={runSearch}
          disabled={isSearching}
          className="rounded-md border border-border-strong bg-surface px-4 text-[13.5px] leading-[1.72] font-semibold text-text transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
        >
          {text.mapSearch}
        </button>
      </div>
      {notFound && <p className="text-caption text-danger">{text.mapNotFound}</p>}
      <HereMap
        center={view.center}
        zoom={view.zoom}
        marker={marker}
        onPick={onPick}
        label={text.mapLabel}
        className="h-[200px] overflow-hidden rounded-[14px] bg-inset"
        fallback={unavailable}
      />
      <p className="text-caption text-muted">{text.mapHint}</p>
    </div>
  );
}
