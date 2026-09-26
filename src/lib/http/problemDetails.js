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

  // PARSING_ERROR: a non-JSON error body (proxy page, etc.) — keep the HTTP status.
  const status =
    typeof err?.status === 'number'
      ? err.status
      : typeof err?.originalStatus === 'number'
        ? err.originalStatus
        : null;

  // 429 and middleware 401/403 may come with an empty body.
  const body = err?.data && typeof err.data === 'object' ? err.data : {};
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const useTitle =
    title && status !== null && status < 500 && !GENERIC_TITLES.has(title.toLowerCase());

  return {
    status,
    message: useTitle ? title : fallbackMessage(status),
    fieldErrors: readFieldErrors(body.errors),
    requestId: typeof body.requestId === 'string' ? body.requestId : null,
  };
}

/**
 * Splits `fieldErrors` into errors for the form's own fields and the rest, which belong in a
 * form-level alert (error codes, or properties the form doesn't have).
 *
 * @param {Record<string, string>} fieldErrors
 * @param {readonly string[]} fieldNames registered form field names
 * @returns {{ fields: Record<string, string>, formMessages: string[] }}
 */
export function splitFieldErrors(fieldErrors, fieldNames) {
  /** @type {Record<string, string>} */
  const fields = {};
  const formMessages = [];
  for (const [key, message] of Object.entries(fieldErrors)) {
    if (fieldNames.includes(key)) fields[key] = message;
    else formMessages.push(message);
  }
  return { fields, formMessages };
}
