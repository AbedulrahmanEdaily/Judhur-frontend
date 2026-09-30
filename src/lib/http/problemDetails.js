import { ar } from '../../locales/ar.js';

/**
 * @typedef {Object} Problem
 * @property {number | null} status HTTP status, or null for network/timeout errors
 * @property {string} message text to show (server `title` when meaningful, else Arabic by status)
 * @property {Record<string, string>} fieldErrors 400 only: first message per request field,
 *   key camelCased (`PhoneNumber` → `phoneNumber`)
 * @property {Record<string, string>} errorCodes 400 only: first message per error code, key kept
 *   as sent (`PropertyErrors.MinImagesRequired`)
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

/**
 * Splits the `errors` of a 400 into request fields and error codes. An error code always has
 * a dot (`Group.Name`); a request field is a PascalCase name without one.
 *
 * @param {unknown} errors
 */
function readErrors(errors) {
  /** @type {Record<string, string>} */
  const fieldErrors = {};
  /** @type {Record<string, string>} */
  const errorCodes = {};
  if (!errors || typeof errors !== 'object') return { fieldErrors, errorCodes };

  for (const [key, messages] of Object.entries(errors)) {
    if (!Array.isArray(messages)) continue;
    const firstMessage = messages.find((message) => typeof message === 'string');
    if (!firstMessage) continue;

    if (key.includes('.')) {
      errorCodes[key] = firstMessage;
    } else {
      const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
      fieldErrors[fieldName] = firstMessage;
    }
  }
  return { fieldErrors, errorCodes };
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
    return {
      status: null,
      message: ar.errors.network,
      fieldErrors: {},
      errorCodes: {},
      requestId: null,
    };
  }
  if (err?.status === 'TIMEOUT_ERROR') {
    return {
      status: null,
      message: ar.errors.timeout,
      fieldErrors: {},
      errorCodes: {},
      requestId: null,
    };
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

  // The database-conflict 409 explains itself in `detail` ("someone already did this").
  if (status === 409 && typeof body.detail === 'string' && body.detail.trim() !== '') {
    message = `${message} — ${body.detail.trim()}`;
  }

  let requestId = null;
  if (typeof body.requestId === 'string') requestId = body.requestId;

  const { fieldErrors, errorCodes } = readErrors(body.errors);
  return { status, message, fieldErrors, errorCodes, requestId };
}

/**
 * The one line to show when a button action fails (a toast or an inline message): for a 400 the
 * business-rule or field message itself (e.g. «يجب رفع 3 صور على الأقل»), else the problem
 * message.
 *
 * @param {unknown} error
 */
export function actionErrorMessage(error) {
  const problem = toProblem(error);
  const codeMessages = Object.values(problem.errorCodes);
  if (codeMessages.length > 0) return codeMessages[0];
  const fieldMessages = Object.values(problem.fieldErrors);
  if (fieldMessages.length > 0) return fieldMessages[0];
  return problem.message;
}
