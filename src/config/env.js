// The only module that reads import.meta.env.

/** Backend origin. Empty in development so requests go through the Vite proxy. */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

/** HERE platform API key (public by nature — restrict it to the app's domains). */
export const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY ?? '';

/** Google OAuth Web client ID for «المتابعة باستخدام Google». Empty hides the button. */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
