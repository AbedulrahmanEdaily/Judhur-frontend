import { splitFieldErrors, toProblem } from '../../lib/http/problemDetails.js';

/**
 * Puts a failed request's errors on the form: validation errors on their fields
 * (`setError`), everything else into one form-level message.
 *
 * @param {unknown} error the RTK Query error
 * @param {(name: any, error: { type: string, message: string }) => void} setError from useForm
 * @param {readonly string[]} fieldNames the form's field names
 * @param {(key: string) => string | undefined} [fieldForKey] maps an error code to a field,
 *   e.g. `identity.InvalidResetCode` → `code`
 * @returns {{ problem: import('../../lib/http/problemDetails.js').Problem, formMessage: string | null }}
 */
export function applyServerErrors(error, setError, fieldNames, fieldForKey) {
  const problem = toProblem(error);

  /** @type {Record<string, string>} */
  const byField = {};
  for (const [key, message] of Object.entries(problem.fieldErrors)) {
    const target = fieldForKey?.(key) ?? key;
    byField[target] ??= message;
  }

  const { fields, formMessages } = splitFieldErrors(byField, fieldNames);
  for (const [name, message] of Object.entries(fields)) {
    setError(name, { type: 'server', message });
  }

  const hasFieldErrors = Object.keys(fields).length > 0;
  const formMessage = formMessages.length
    ? formMessages.join(' ')
    : hasFieldErrors
      ? null
      : problem.message;

  return { problem, formMessage };
}
