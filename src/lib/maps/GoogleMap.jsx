import { useEffect, useRef, useState } from 'react';
import { createMap, DEFAULT_ZOOM, loadGoogleMaps } from './googleMaps.js';

/** The marker in the brand colors (read from the theme tokens, so dark mode matches). */
function brandPin(maps) {
  const styles = getComputedStyle(document.documentElement);
  return new maps.marker.PinElement({
    background: styles.getPropertyValue('--color-brand').trim(),
    borderColor: styles.getPropertyValue('--color-brand-hover').trim(),
    glyphColor: styles.getPropertyValue('--color-inverse').trim(),
  });
}

/**
 * A Google map with at most one marker. Created once; `center`, `zoom` and `marker` changes are
 * applied to the live map. While the library loads the box stays empty; if it cannot load (no
 * key, blocked, offline) `fallback` is rendered instead. With `onPick`, a tap reports the point,
 * and the marker can be dragged to a new one.
 *
 * @param {{
 *   center: { lat: number, lng: number },
 *   zoom?: number,
 *   marker?: { lat: number, lng: number } | null,
 *   onPick?: (point: { latitude: number, longitude: number }) => void,
 *   satellite?: boolean,
 *   label: string,
 *   className?: string,
 *   fallback: import('react').ReactNode,
 * }} props
 */
export function GoogleMap({
  center,
  zoom = DEFAULT_ZOOM,
  marker,
  onPick,
  satellite = false,
  label,
  className,
  fallback,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const firstView = useRef({ center, zoom, satellite, canPick: Boolean(onPick) });
  const onPickRef = useRef(onPick);
  const [status, setStatus] = useState('loading');

  // Always call the newest onPick without re-adding the map listeners.
  useEffect(() => {
    onPickRef.current = onPick;
  });

  useEffect(() => {
    let isUnmounted = false;
    let created = null;

    loadGoogleMaps()
      .then((maps) => {
        if (isUnmounted) return;
        const view = firstView.current;
        const map = createMap(maps, containerRef.current, {
          center: view.center,
          zoom: view.zoom,
          satellite: view.satellite,
          // While picking, a tap on a shop or a mosque sets the point instead of opening it.
          clickableIcons: !view.canPick,
        });
        map.addListener('click', (event) => {
          if (!onPickRef.current || !event.latLng) return;
          onPickRef.current({ latitude: event.latLng.lat(), longitude: event.latLng.lng() });
        });
        created = { maps, map, marker: null };
        mapRef.current = created;
        setStatus('ready');
      })
      .catch(() => {
        if (!isUnmounted) setStatus('failed');
      });

    return () => {
      isUnmounted = true;
      if (created) {
        if (created.marker) created.marker.map = null;
        created.maps.event.clearInstanceListeners(created.map);
      }
      mapRef.current = null;
    };
  }, []);

  const centerLat = center.lat;
  const centerLng = center.lng;
  useEffect(() => {
    if (status !== 'ready') return;
    mapRef.current.map.setCenter({ lat: centerLat, lng: centerLng });
    mapRef.current.map.setZoom(zoom);
  }, [status, centerLat, centerLng, zoom]);

  const markerLat = marker?.lat;
  const markerLng = marker?.lng;
  const canPick = Boolean(onPick);
  useEffect(() => {
    if (status !== 'ready') return;
    const state = mapRef.current;
    if (state.marker) {
      state.marker.map = null;
      state.marker = null;
    }
    if (markerLat === undefined || markerLng === undefined) return;

    const pin = new state.maps.marker.AdvancedMarkerElement({
      map: state.map,
      position: { lat: markerLat, lng: markerLng },
      content: brandPin(state.maps),
      gmpDraggable: canPick,
    });
    if (canPick) {
      pin.addListener('dragend', () => {
        const point = new state.maps.LatLng(pin.position);
        if (onPickRef.current) {
          onPickRef.current({ latitude: point.lat(), longitude: point.lng() });
        }
      });
    }
    state.marker = pin;
  }, [status, markerLat, markerLng, canPick]);

  if (status === 'failed') return fallback;
  return <div ref={containerRef} role="application" aria-label={label} className={className} />;
}
