import { ar } from '../../locales/ar.js';

/**
 * @typedef {Object} Problem
 * @property {number | null} status HTTP status, or null for network/timeout errors
 * @property {string} message text to show (server `title` when meaningful, else Arabic by status)
 * @property {Record<string, string>} fieldErrors first message per `errors` key, key camelCased
 * @property {string | null} requestId from the ProblemDetails body, for reporting 500s
 */

// ASP.NET default titles carry no information for the user; replace them with our Arabic text.
const GENERIC_TITLES = new Set([
  'bad request',
  'unauthorized',
  'forbidden',
  'not found',
  'conflict',
  'too many requests',
  'internal server error',
  'one or more validation errors occurred.',
  'an error occurred while processing your request.',
]);

/** @param {number | null} status */
function fallbackMessage(status) {
  switch (status) {
    case 400:
      return ar.errors.validation;
    case 401:
      return ar.errors.unauthorized;
    case 403:
      return ar.errors.forbidden;
    case 404:
      return ar.errors.notFound;
    case 409:
      return ar.errors.conflict;
    case 429:
      return ar.errors.tooManyRequests;
    default:
      return ar.errors.unexpected;
  }
}

/** `PhoneNumber` → `phoneNumber`; error codes like `Identity.InvalidResetCode` keep their shape. */
const camelFirst = (key) => key.charAt(0).toLowerCase() + key.slice(1);

/** @param {unknown} errors */
function readFieldErrors(errors) {
  /** @type {Record<string, string>} */
  const fieldErrors = {};
  if (!errors || typeof errors !== 'object') return fieldErrors;
  for (const [key, messages] of Object.entries(errors)) {
    const first = Array.isArray(messages) ? messages.find((m) => typeof m === 'string') : null;
    if (first) fieldErrors[camelFirst(key)] = first;
  }
  return fieldErrors;
}

/**
 * Turns any RTK Query error (FetchBaseQueryError or SerializedError) into one shape.
 * Use this everywhere errors are shown.
 *
 * @param {unknown} error
 * @returns {Problem}
 */
export function toProblem(error) {
  const err = /** @type {any} */ (error);

  if (err?.status === 'FETCH_ERROR') {
    return { status: null, message: ar.errors.network, fieldErrors: {}, requestId: null };
  }
  if (err?.status === 'TIMEOUT_ERROR') {
    return { status: null, message: ar.errors.timeout, fieldErrors: {}, requestId: null };
  }

  let status = null;
  if (typeof err?.status === 'number') status = err.status;
  // PARSING_ERROR: a non-JSON error body (proxy page, etc.) — keep the HTTP status.
  if (typeof err?.originalStatus === 'number') status = err.originalStatus;

  // 429 and middleware 401/403 may come with an empty body.
  let body = {};
  if (err?.data && typeof err.data === 'object') body = err.data;

  let title = '';
  if (typeof body.title === 'string') title = body.title.trim();

  let message = fallbackMessage(status);
  const titleIsUseful = title !== '' && !GENERIC_TITLES.has(title.toLowerCase());
  if (titleIsUseful && status !== null && status < 500) message = title;

  let requestId = null;
  if (typeof body.requestId === 'string') requestId = body.requestId;

  return { status, message, fieldErrors: readFieldErrors(body.errors), requestId };
}
