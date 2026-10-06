import { HERE_API_KEY } from '../../config/env.js';

// HERE Geocoding & Search v7 (REST, same key). Arabic results, limited to the area around
// Palestine. Both return null when there is no key, no result, or the request fails — the
// address fields stay for the user to fill in.

const PALESTINE_AREA = 'bbox:34.2,29.4,35.95,33.4';

async function getJson(url) {
  if (!HERE_API_KEY) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * A point → its address, to suggest «العنوان الكامل», the city and the area.
 * @param {{ latitude: number, longitude: number }} point
 * @returns {Promise<{ label: string, city?: string, district?: string } | null>}
 */
export async function reverseGeocode({ latitude, longitude }) {
  const params = new URLSearchParams({
    at: `${latitude},${longitude}`,
    lang: 'ar',
    apiKey: HERE_API_KEY,
  });
  const data = await getJson(`https://revgeocode.search.hereapi.com/v1/revgeocode?${params}`);
  const address = data?.items?.[0]?.address;
  if (!address) return null;
  return { label: address.label, city: address.city, district: address.district };
}

/**
 * Free text → the first matching place, to move the map there.
 * @param {string} text
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
export async function searchPlace(text) {
  const params = new URLSearchParams({
    q: text,
    in: PALESTINE_AREA,
    lang: 'ar',
    apiKey: HERE_API_KEY,
  });
  const data = await getJson(`https://geocode.search.hereapi.com/v1/geocode?${params}`);
  const position = data?.items?.[0]?.position;
  if (!position) return null;
  return { lat: position.lat, lng: position.lng };
}
