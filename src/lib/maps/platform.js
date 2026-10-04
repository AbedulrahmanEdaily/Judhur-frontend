import { HERE_API_KEY } from '../../config/env.js';

// HERE Maps API for JavaScript 3.1, loaded from HERE's own CDN the first time a map mounts, so
// pages without a map never download it. (The npm package lives on HERE's private registry,
// which the build environment cannot reach — see the project guide section 10.)
const HERE_CDN = 'https://js.api.here.com/v3/3.1';
const SCRIPTS = ['mapsjs-core.js', 'mapsjs-service.js', 'mapsjs-mapevents.js', 'mapsjs-ui.js'];

/** Palestine, roughly — the default view (the project guide 10.3). */
export const DEFAULT_CENTER = { lat: 31.9, lng: 35.2 };
export const DEFAULT_ZOOM = 8;

let loading = null;
let platform = null;

/** Adds the script once; a retry after a failed load replaces the failed tag instead of adding. */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const old = document.head.querySelector(`script[src="${src}"]`);
    if (old && old.dataset.loaded === 'true') {
      resolve();
      return;
    }
    if (old) old.remove();

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(script);
  });
}

function loadStylesheet(href) {
  if (document.head.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.append(link);
}

/** True when a HERE key is configured; without one the pages show their fallback. */
export function hasMapKey() {
  return HERE_API_KEY !== '';
}

/**
 * Loads the library once and resolves with the global `H`. The scripts depend on each other,
 * so they load one after the other. A failed load can be tried again later.
 * @returns {Promise<any>}
 */
export function loadHere() {
  if (!hasMapKey()) return Promise.reject(new Error('VITE_HERE_API_KEY is not set'));
  if (!loading) {
    loading = (async () => {
      loadStylesheet(`${HERE_CDN}/mapsjs-ui.css`);
      for (const file of SCRIPTS) {
        await loadScript(`${HERE_CDN}/${file}`);
      }
      return window.H;
    })();
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

/** The one `H.service.Platform` of the app. */
export function getPlatform(H) {
  if (!platform) platform = new H.service.Platform({ apikey: HERE_API_KEY });
  return platform;
}
