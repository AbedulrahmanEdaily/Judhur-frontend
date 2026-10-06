// The only module that reads import.meta.env.

/** Backend origin. Empty in development so requests go through the Vite proxy. */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

/** Google Maps API key (public by nature — restrict it to the app's domains). */
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';

/** Google Maps map ID; the price pins need one. Google's demo ID works until a real one is made. */
export const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

/** Google OAuth Web client ID for «المتابعة باستخدام Google». Empty hides the button. */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
