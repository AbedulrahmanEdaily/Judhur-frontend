import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconMinus17, IconPlus17 } from '../../components/icons/index.js';
import { createMap, DEFAULT_CENTER, DEFAULT_ZOOM, loadGoogleMaps } from './googleMaps.js';

// One listing fills the view at street level; a fitted view never zooms in closer than this.
const MAX_FIT_ZOOM = 15;

// Figma map price pin (71:1398): pill, 14×8, 13 bold, shadow; brand when chosen, raised else.
// Google puts the bottom of the pin on the point; half its height down centers it there.
const pinClasses =
  'cursor-pointer whitespace-nowrap rounded-full border px-[13px] py-[7px] text-[13px] leading-[1.7] font-bold shadow-marker translate-y-1/2';
const activePinClasses = 'border-brand bg-brand text-inverse';
const idlePinClasses = 'border-border-strong bg-raised text-text';

const zoomButtonClasses =
  'flex p-[10px] text-text-secondary transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand';

/** The HTML of one price pin. */
function pinElement(label, isActive) {
  const element = document.createElement('div');
  element.className = clsx(pinClasses, isActive ? activePinClasses : idlePinClasses);
  element.dir = 'ltr';
  element.textContent = label;
  return element;
}

/** Takes the pins off the map. */
function removePins(pins) {
  for (const pin of pins) pin.map = null;
}

/**
 * A Google map of several listings: one price pin each (Figma 71:1397), the chosen one in brand,
 * and the Figma zoom buttons (71:1410) instead of Google's own. The «خريطة | قمر صناعي» switch
 * stays. The view fits the pins whenever the set of listings changes. A tap on a pin calls
 * `onSelect` with its id. If the library cannot load, `fallback` is rendered.
 *
 * @param {{
 *   markers: { id: string, lat: number, lng: number, label: string }[],
 *   activeId?: string | null,
 *   onSelect: (id: string) => void,
 *   label: string,
 *   zoomInLabel: string,
 *   zoomOutLabel: string,
 *   className?: string,
 *   fallback: import('react').ReactNode,
 * }} props
 */
export function MarkersMap({
  markers,
  activeId,
  onSelect,
  label,
  zoomInLabel,
  zoomOutLabel,
  className,
  fallback,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const fittedKeyRef = useRef('');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  useEffect(() => {
    let isUnmounted = false;
    let created = null;

    loadGoogleMaps()
      .then((maps) => {
        if (isUnmounted) return;
        const map = createMap(maps, containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          ownControls: true,
        });
        created = { maps, map, pins: [] };
        mapRef.current = created;
        setStatus('ready');
      })
      .catch(() => {
        if (!isUnmounted) setStatus('failed');
      });

    return () => {
      isUnmounted = true;
      if (created) {
        removePins(created.pins);
        created.maps.event.clearInstanceListeners(created.map);
      }
      mapRef.current = null;
    };
  }, []);

  // Rebuilt when the pins or the chosen one change (a page holds at most a few dozen).
  const markersKey = JSON.stringify(markers);
  useEffect(() => {
    if (status !== 'ready') return;
    const state = mapRef.current;
    const { maps, map } = state;
    removePins(state.pins);
    state.pins = [];
    const list = JSON.parse(markersKey);
    if (list.length === 0) return;

    const bounds = new maps.LatLngBounds();
    for (const item of list) {
      const isActive = item.id === activeId;
      const pin = new maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: item.lat, lng: item.lng },
        content: pinElement(item.label, isActive),
        title: item.label,
        zIndex: isActive ? 1 : 0,
        gmpClickable: true,
      });
      pin.addEventListener('gmp-click', () => onSelectRef.current(item.id));
      state.pins.push(pin);
      bounds.extend({ lat: item.lat, lng: item.lng });
    }

    // Fit only when the listings change, not when another pin is chosen.
    const idsKey = list.map((item) => item.id).join(',');
    if (fittedKeyRef.current === idsKey) return;
    fittedKeyRef.current = idsKey;
    if (list.length === 1) {
      map.setCenter({ lat: list[0].lat, lng: list[0].lng });
      map.setZoom(MAX_FIT_ZOOM);
      return;
    }
    map.fitBounds(bounds, 64);
    maps.event.addListenerOnce(map, 'idle', () => {
      if (map.getZoom() > MAX_FIT_ZOOM) map.setZoom(MAX_FIT_ZOOM);
    });
  }, [status, markersKey, activeId]);

  function zoomBy(step) {
    const map = mapRef.current?.map;
    if (map) map.setZoom(map.getZoom() + step);
  }

  if (status === 'failed') return fallback;
  return (
    <div className={clsx('relative', className)}>
      <div ref={containerRef} role="application" aria-label={label} className="size-full" />
      {status === 'ready' && (
        <div className="absolute end-6 top-6 flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border bg-raised">
          <button
            type="button"
            onClick={() => zoomBy(1)}
            aria-label={zoomInLabel}
            className={zoomButtonClasses}
          >
            <IconPlus17 />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(-1)}
            aria-label={zoomOutLabel}
            className={zoomButtonClasses}
          >
            <IconMinus17 />
          </button>
        </div>
      )}
    </div>
  );
}
