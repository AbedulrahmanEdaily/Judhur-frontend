import { GOOGLE_CLIENT_ID } from '../config/env.js';

// Google Identity Services ("Sign in with Google"). The script is loaded once, the first time a
// Google button mounts, so pages without one never download it.

const SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let loading = null;
let isInitialized = false;
let credentialListener = null;

/** True when a client ID is configured (VITE_GOOGLE_CLIENT_ID). */
export function hasGoogleClientId() {
  return GOOGLE_CLIENT_ID !== '';
}

/** Loads the Google script once and resolves with `window.google`. */
export function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => {
        // Let a later mount try again.
        loading = null;
        script.remove();
        reject(new Error('Google Identity Services failed to load'));
      };
      document.head.appendChild(script);
    });
  }
  return loading;
}

/**
 * Sends the next Google credential (the idToken) to `listener`. Google's `initialize` is meant
 * to run once per page, so it runs the first time and its callback forwards to the button that
 * is on screen now.
 *
 * @param {any} google
 * @param {((idToken: string) => void) | null} listener
 */
export function setGoogleCredentialListener(google, listener) {
  credentialListener = listener;
  if (isInitialized) return;
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => {
      if (credentialListener) credentialListener(response.credential);
    },
  });
  isInitialized = true;
}
