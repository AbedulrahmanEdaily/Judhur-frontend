import { useEffect, useRef, useState } from 'react';
import { createHereMap, DEFAULT_ZOOM, loadHere } from './platform.js';

/**
 * A HERE map with at most one marker. Created once and disposed on unmount; `center`, `zoom`
 * and `marker` changes are applied to the live map. While the library loads the box stays empty;
 * if it cannot load (no key, blocked, offline) `fallback` is rendered instead.
 * With `onPick`, a tap reports the point, and the marker can be dragged to a new one.
 *
 * @param {{
 *   center: { lat: number, lng: number },
 *   zoom?: number,
 *   marker?: { lat: number, lng: number } | null,
 *   onPick?: (point: { latitude: number, longitude: number }) => void,
 *   label: string,
 *   className?: string,
 *   fallback: import('react').ReactNode,
 * }} props
 */
export function HereMap({
  center,
  zoom = DEFAULT_ZOOM,
  marker,
  onPick,
  label,
  className,
  fallback,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const firstView = useRef({ center, zoom });
  const onPickRef = useRef(onPick);
  const [status, setStatus] = useState('loading');

  // Always call the newest onPick without re-adding the map listeners.
  useEffect(() => {
    onPickRef.current = onPick;
  });

  useEffect(() => {
    let isUnmounted = false;
    let cleanup = null;

    loadHere()
      .then((H) => {
        if (isUnmounted) return;
        const { map, behavior, dispose } = createHereMap(H, containerRef.current, {
          center: firstView.current.center,
          zoom: firstView.current.zoom,
          defaultUi: true,
        });

        function pick(point) {
          if (onPickRef.current) onPickRef.current({ latitude: point.lat, longitude: point.lng });
        }
        function pointerToGeo(event) {
          return map.screenToGeo(event.currentPointer.viewportX, event.currentPointer.viewportY);
        }
        function handleTap(event) {
          // A tap on the marker itself is not a new point.
          if (event.target instanceof H.map.Marker) return;
          pick(pointerToGeo(event));
        }
        // Dragging the marker: the map must not pan meanwhile (HERE's drag-marker pattern).
        function handleDragStart(event) {
          if (event.target instanceof H.map.Marker) behavior.disable();
        }
        function handleDrag(event) {
          if (event.target instanceof H.map.Marker) event.target.setGeometry(pointerToGeo(event));
        }
        function handleDragEnd(event) {
          if (!(event.target instanceof H.map.Marker)) return;
          behavior.enable();
          pick(event.target.getGeometry());
        }
        map.addEventListener('tap', handleTap);
        map.addEventListener('dragstart', handleDragStart);
        map.addEventListener('drag', handleDrag);
        map.addEventListener('dragend', handleDragEnd);

        mapRef.current = { H, map, marker: null };
        cleanup = () => {
          map.removeEventListener('tap', handleTap);
          map.removeEventListener('dragstart', handleDragStart);
          map.removeEventListener('drag', handleDrag);
          map.removeEventListener('dragend', handleDragEnd);
          dispose();
        };
        setStatus('ready');
      })
      .catch(() => {
        if (!isUnmounted) setStatus('failed');
      });

    return () => {
      isUnmounted = true;
      if (cleanup) cleanup();
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
      state.map.removeObject(state.marker);
      state.marker = null;
    }
    if (markerLat !== undefined && markerLng !== undefined) {
      // A draggable marker must be volatile so HERE redraws it while it moves.
      state.marker = new state.H.map.Marker(
        { lat: markerLat, lng: markerLng },
        { volatility: canPick },
      );
      state.marker.draggable = canPick;
      state.map.addObject(state.marker);
    }
  }, [status, markerLat, markerLng, canPick]);

  if (status === 'failed') return fallback;
  return <div ref={containerRef} role="application" aria-label={label} className={className} />;
}
