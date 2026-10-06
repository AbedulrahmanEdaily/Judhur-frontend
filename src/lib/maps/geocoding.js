import { loadGoogleMaps } from './googleMaps.js';

// Google Geocoding through the Maps library (same key; the Geocoding API must be enabled on it).
// Arabic results, leaning toward the area around Palestine. Both return null when there is no
// key, no result, or the request fails — the address fields stay for the user to fill in.

const PALESTINE_AREA = { south: 29.4, west: 34.2, north: 33.4, east: 35.95 };

/** The results of a Geocoder request; empty on no result or any failure. */
async function geocode(request) {
  try {
    const maps = await loadGoogleMaps();
    const { Geocoder } = await maps.importLibrary('geocoding');
    const response = await new Geocoder().geocode(request);
    return response.results;
  } catch {
    // No result is an error too (ZERO_RESULTS).
    return [];
  }
}

/** The long name of the address part of one type («locality» is the city). */
function addressPart(result, type) {
  const part = result.address_components.find((component) => component.types.includes(type));
  return part?.long_name;
}

/**
 * A point → its address, to suggest «العنوان الكامل», the city and the area.
 * @param {{ latitude: number, longitude: number }} point
 * @returns {Promise<{ label: string, city?: string, district?: string } | null>}
 */
export async function reverseGeocode({ latitude, longitude }) {
  const results = await geocode({ location: { lat: latitude, lng: longitude } });
  // A plus code («8G9V+2X») is not an address a buyer can read.
  const result = results.find((item) => !item.types.includes('plus_code'));
  if (!result) return null;
  return {
    label: result.formatted_address,
    city: addressPart(result, 'locality'),
    district: addressPart(result, 'sublocality') ?? addressPart(result, 'neighborhood'),
  };
}

/**
 * Free text → the first matching place, to move the map there.
 * @param {string} text
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
export async function searchPlace(text) {
  const results = await geocode({ address: text, bounds: PALESTINE_AREA, region: 'ps' });
  if (results.length === 0) return null;
  const location = results[0].geometry.location;
  return { lat: location.lat(), lng: location.lng() };
}
