import { actionErrorMessage, toProblem } from '../../lib/http/problemDetails.js';
import { ar } from '../../locales/ar.js';

const CHANGED_SINCE_REVIEW = 'Properties.ChangedSinceReview';

/**
 * The message of a failed approve or reject: the owner changing the listing after the review
 * was opened gets its own wording; anything else uses the server's message.
 */
export function decisionErrorMessage(error) {
  if (toProblem(error).code === CHANGED_SINCE_REVIEW) return ar.admin.changedSinceReview;
  return actionErrorMessage(error);
}
