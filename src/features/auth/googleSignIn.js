import { ar } from '../../locales/ar.js';

/** 400 error code of `POST /google` for a first-time Google user without phone and city. */
export const GOOGLE_REGISTRATION_INCOMPLETE = 'Identity.GoogleRegistrationIncomplete';

/**
 * The message for a failed Google sign-in: 401 has its own text, 403 shows the server title
 * (unverified Google email or locked account), 429 and the rest the usual message.
 *
 * @param {import('../../lib/http/problemDetails.js').Problem} problem
 */
export function googleFailureMessage(problem) {
  if (problem.status === 401) return ar.auth.googleFailed;
  return problem.message;
}
