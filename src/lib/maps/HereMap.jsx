import { useEffect, useRef, useState } from 'react';
import { DEFAULT_ZOOM, getPlatform, loadHere } from './platform.js';

/**
 * A HERE map with at most one marker. Created once and disposed on unmount; `center`, `zoom`
 * and `marker` changes are applied to the live map. While the library loads the box stays empty;
 * if it cannot load (no key, blocked, offline) `fallback` is rendered instead.
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

  // Always call the newest onPick without re-adding the map listener.
  useEffect(() => {
    onPickRef.current = onPick;
  });

  useEffect(() => {
    let isUnmounted = false;
    let cleanup = null;

    loadHere()
      .then((H) => {
        if (isUnmounted) return;
        const layers = getPlatform(H).createDefaultLayers();
        const map = new H.Map(containerRef.current, layers.vector.normal.map, {
          center: firstView.current.center,
          zoom: firstView.current.zoom,
          pixelRatio: window.devicePixelRatio || 1,
        });
        new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        H.ui.UI.createDefault(map, layers);

        function handleTap(event) {
          if (!onPickRef.current) return;
          const point = map.screenToGeo(
            event.currentPointer.viewportX,
            event.currentPointer.viewportY,
          );
          onPickRef.current({ latitude: point.lat, longitude: point.lng });
        }
        function handleResize() {
          map.getViewPort().resize();
        }
        map.addEventListener('tap', handleTap);
        window.addEventListener('resize', handleResize);

        mapRef.current = { H, map, marker: null };
        cleanup = () => {
          window.removeEventListener('resize', handleResize);
          map.dispose();
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
  useEffect(() => {
    if (status !== 'ready') return;
    const state = mapRef.current;
    if (state.marker) {
      state.map.removeObject(state.marker);
      state.marker = null;
    }
    if (markerLat !== undefined && markerLng !== undefined) {
      state.marker = new state.H.map.Marker({ lat: markerLat, lng: markerLng });
      state.map.addObject(state.marker);
    }
  }, [status, markerLat, markerLng]);

  if (status === 'failed') return fallback;
  return <div ref={containerRef} role="application" aria-label={label} className={className} />;
}
