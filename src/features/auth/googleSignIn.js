import { GOOGLE_CLIENT_ID } from '../../config/env.js';
import { ar } from '../../locales/ar.js';

// Sign in with Google by redirect (OpenID Connect, implicit flow): the button sends the browser
// to Google's own sign-in page, and Google sends it back to GOOGLE_CALLBACK_PATH with an
// `id_token` in the URL fragment. That idToken goes to `POST /google` as is.

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

/** The page Google returns to. Register `<origin>/auth/google` as a redirect URI in Google Cloud. */
export const GOOGLE_CALLBACK_PATH = '/auth/google';

// What the callback needs to know about the attempt; no token is ever stored.
const PENDING_KEY = 'judhur.googleSignIn';

/** 400 error code of `POST /google` for a first-time Google user without phone and city. */
export const GOOGLE_REGISTRATION_INCOMPLETE = 'Identity.GoogleRegistrationIncomplete';

let readResult = null;

/** True when a client ID is configured (VITE_GOOGLE_CLIENT_ID). */
export function hasGoogleClientId() {
  return GOOGLE_CLIENT_ID !== '';
}

function writePending(value) {
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(value));
  } catch {
    // Without storage the callback can't check the state and shows an error.
  }
}

function takePending() {
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    window.sessionStorage.removeItem(PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Goes to Google's sign-in page. `returnTo` is where a signed-in user lands afterwards;
 * `startPath` is the page to go back to (cancel, error, «رجوع»).
 *
 * @param {{ returnTo: string, startPath: string }} paths
 */
export function startGoogleSignIn({ returnTo, startPath }) {
  const state = crypto.randomUUID();
  writePending({ state, returnTo, startPath });
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${window.location.origin}${GOOGLE_CALLBACK_PATH}`,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: crypto.randomUUID(),
    state,
    prompt: 'select_account',
  });
  window.location.assign(`${GOOGLE_AUTH_URL}?${params}`);
}

/**
 * Reads Google's answer from the URL fragment, checks the `state`, and removes the fragment from
 * the address bar so the token doesn't stay in the URL or the history. Read once per return:
 * later calls give the same result.
 *
 * @returns {{ idToken: string | null, error: string | null, returnTo: string, startPath: string }}
 */
export function readGoogleCallback() {
  if (readResult) return readResult;

  const answer = new URLSearchParams(window.location.hash.slice(1));
  window.history.replaceState(null, '', window.location.pathname);
  const pending = takePending();

  let returnTo = '/';
  let startPath = '/login';
  if (pending) {
    returnTo = pending.returnTo;
    startPath = pending.startPath;
  }

  let error = null;
  let idToken = answer.get('id_token');
  if (answer.get('error') === 'access_denied') {
    error = ar.auth.googleCancelled;
  } else if (!idToken || !pending || answer.get('state') !== pending.state) {
    error = ar.auth.googleExpired;
  }
  if (error) idToken = null;

  readResult = { idToken, error, returnTo, startPath };
  return readResult;
}

/**
 * The message for a failed `POST /google`: 401 has its own text, 403 shows the server title
 * (unverified Google email or locked account), 429 and the rest the usual message.
 *
 * @param {import('../../lib/http/problemDetails.js').Problem} problem
 */
export function googleFailureMessage(problem) {
  if (problem.status === 401) return ar.auth.googleFailed;
  return problem.message;
}
