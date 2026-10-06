import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID } from '../../config/env.js';

// Google Maps JavaScript API, loaded from Google the first time a map mounts, so pages without
// a map never download it. Arabic labels and controls, region Palestine.
const SCRIPT_URL = 'https://maps.googleapis.com/maps/api/js';
const READY_CALLBACK = 'judhurMapsReady';

/** Palestine, roughly — the default view (the project guide 10.3). */
export const DEFAULT_CENTER = { lat: 31.9, lng: 35.2 };
export const DEFAULT_ZOOM = 8;

let loading = null;

/** True when a Maps key is configured; without one the pages show their fallback. */
export function hasMapKey() {
  return GOOGLE_MAPS_API_KEY !== '';
}

/** Adds the script tag and waits for Google's ready callback. */
function loadScript() {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_API_KEY,
      v: 'weekly',
      language: 'ar',
      region: 'PS',
      loading: 'async',
      callback: READY_CALLBACK,
    });
    const script = document.createElement('script');
    script.src = `${SCRIPT_URL}?${params}`;
    script.async = true;
    window[READY_CALLBACK] = () => resolve();
    // A failed tag is removed so a later try adds a fresh one.
    script.onerror = () => {
      script.remove();
      reject(new Error('Could not load Google Maps'));
    };
    document.head.append(script);
  });
}

/**
 * Loads the library once and resolves with `google.maps`, with the map and marker libraries
 * ready. A failed load can be tried again later.
 * @returns {Promise<any>}
 */
export function loadGoogleMaps() {
  if (!hasMapKey()) return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not set'));
  if (!loading) {
    loading = (async () => {
      await loadScript();
      const maps = window.google.maps;
      await maps.importLibrary('maps');
      await maps.importLibrary('marker');
      return maps;
    })();
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

/** The map follows the site theme it opens in. */
function isDarkTheme() {
  return document.documentElement.classList.contains('dark');
}

/**
 * A Google map in `element` with the «خريطة | قمر صناعي» switch. `satellite` starts on the
 * satellite photos (with street names). `ownControls` is for a page with its own Figma zoom
 * buttons: no Google zoom or full-screen buttons, and one finger moves the map. Otherwise a
 * page scroll passes over the map until two fingers (or Ctrl + wheel) are used.
 *
 * @param {any} maps `google.maps`
 * @param {HTMLElement} element
 * @param {{
 *   center: { lat: number, lng: number },
 *   zoom: number,
 *   satellite?: boolean,
 *   ownControls?: boolean,
 *   clickableIcons?: boolean,
 * }} options
 */
export function createMap(maps, element, options) {
  let mapTypeId = 'roadmap';
  if (options.satellite) mapTypeId = 'hybrid';
  let gestureHandling = 'cooperative';
  if (options.ownControls) gestureHandling = 'greedy';
  let colorScheme = maps.ColorScheme.LIGHT;
  if (isDarkTheme()) colorScheme = maps.ColorScheme.DARK;

  return new maps.Map(element, {
    center: options.center,
    zoom: options.zoom,
    mapId: GOOGLE_MAPS_MAP_ID,
    mapTypeId,
    colorScheme,
    gestureHandling,
    clickableIcons: options.clickableIcons ?? true,
    disableDefaultUI: true,
    mapTypeControl: true,
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'hybrid'],
      position: maps.ControlPosition.BLOCK_START_INLINE_START,
    },
    zoomControl: !options.ownControls,
    fullscreenControl: !options.ownControls,
  });
}
