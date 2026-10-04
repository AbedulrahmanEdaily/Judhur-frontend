import { toProblem } from '../../lib/http/problemDetails.js';

/**
 * Puts a failed request's errors on the form. Request-field errors go on the field with the
 * same name through `setError`; `serverKeyFields` sends other server keys to a field too — a
 * 400 error code, or the `code` of another error (its message is the `title`).
 * Everything else becomes one form-level message.
 *
 * @param {unknown} error the RTK Query error
 * @param {(name: any, error: { type: string, message: string }) => void} setError from useForm
 * @param {string[]} fieldNames the form's field names
 * @param {Record<string, string>} [serverKeyFields] server keys that belong to a form field —
 *   error codes, or request fields the form names differently,
 *   e.g. { 'Identity.InvalidResetCode': 'code', 'Identity.DuplicateEmail': 'email' }
 * @returns {{ problem: import('../../lib/http/problemDetails.js').Problem, formMessage: string | null }}
 */
export function applyServerErrors(error, setError, fieldNames, serverKeyFields = {}) {
  const problem = toProblem(error);
  const formMessages = [];
  let hasFieldError = false;

  function putOnField(fieldName, message) {
    if (fieldName && fieldNames.includes(fieldName)) {
      setError(fieldName, { type: 'server', message });
      hasFieldError = true;
    } else {
      formMessages.push(message);
    }
  }

  for (const [key, message] of Object.entries(problem.fieldErrors)) {
    putOnField(serverKeyFields[key] ?? key, message);
  }
  for (const [code, message] of Object.entries(problem.errorCodes)) {
    putOnField(serverKeyFields[code], message);
  }
  // A non-validation error (409 `Identity.DuplicateEmail`, …) carries its code next to the title.
  const codeField = problem.code ? serverKeyFields[problem.code] : undefined;
  if (codeField && fieldNames.includes(codeField)) putOnField(codeField, problem.message);

  let formMessage = null;
  if (formMessages.length > 0) formMessage = formMessages.join(' ');
  else if (!hasFieldError) formMessage = problem.message;

  return { problem, formMessage };
}
