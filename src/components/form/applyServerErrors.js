import { toProblem } from '../../lib/http/problemDetails.js';

/**
 * Puts a failed request's errors on the form: validation errors go on their fields through
 * `setError`, everything else becomes one form-level message.
 *
 * @param {unknown} error the RTK Query error
 * @param {(name: any, error: { type: string, message: string }) => void} setError from useForm
 * @param {string[]} fieldNames the form's field names
 * @param {Record<string, string>} [errorCodeFields] error codes that belong to a field,
 *   e.g. { 'identity.InvalidResetCode': 'code' }
 * @returns {{ problem: import('../../lib/http/problemDetails.js').Problem, formMessage: string | null }}
 */
export function applyServerErrors(error, setError, fieldNames, errorCodeFields = {}) {
  const problem = toProblem(error);
  const formMessages = [];
  let hasFieldError = false;

  for (const [key, message] of Object.entries(problem.fieldErrors)) {
    const fieldName = errorCodeFields[key] ?? key;
    if (fieldNames.includes(fieldName)) {
      setError(fieldName, { type: 'server', message });
      hasFieldError = true;
    } else {
      formMessages.push(message);
    }
  }

  let formMessage = null;
  if (formMessages.length > 0) formMessage = formMessages.join(' ');
  else if (!hasFieldError) formMessage = problem.message;

  return { problem, formMessage };
}
