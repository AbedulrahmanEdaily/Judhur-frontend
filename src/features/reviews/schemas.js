import { z } from 'zod';
import { ar } from '../../locales/ar.js';
import { MAX_RATING, MAX_REVIEW_COMMENT_LENGTH, MIN_RATING, RATING_STEP } from './constants.js';

// Mirror the backend rules of the review endpoints (the project guide 6.18). The server stays the
// authority. An empty comment becomes null, which also clears it on an edit.

const messages = ar.reviews.validation;

/** `POST /User/Reviews` and `PUT /User/Reviews/{id}`: a rating 0.5–5 (half steps), a comment ≤ 500. */
export const reviewSchema = z
  .object({
    rating: z
      .number({ error: messages.ratingRequired })
      .min(MIN_RATING, messages.ratingRequired)
      .max(MAX_RATING, messages.ratingRequired)
      .multipleOf(RATING_STEP, messages.ratingRequired),
    comment: z.string().trim().max(MAX_REVIEW_COMMENT_LENGTH, messages.commentTooLong),
  })
  .transform((values) => {
    let comment = null;
    if (values.comment !== '') comment = values.comment;
    return { rating: values.rating, comment };
  });
