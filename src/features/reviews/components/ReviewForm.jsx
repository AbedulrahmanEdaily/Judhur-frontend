import { useId, useState } from 'react';
import { useController, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { Button } from '../../../components/ui/Button.jsx';
import { StarRatingInput } from '../../../components/ui/StarRatingInput.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { ListingTextarea } from '../../properties/components/ListingTextarea.jsx';
import { MAX_REVIEW_COMMENT_LENGTH } from '../constants.js';
import { useCreateReviewMutation, useUpdateReviewMutation } from '../reviewsApi.js';
import { reviewSchema } from '../schemas.js';

const text = ar.reviews;
const FIELD_NAMES = ['rating', 'comment'];

/**
 * «قيّم هذا البائع» (not in Figma — a card with the star input and the description box): the
 * stars (0.5–5), the comment with a counter to 500, submit. With `review` it edits that review
 * (PUT) and offers «إلغاء». A 409 (not eligible, already reviewed, or a database conflict) or a
 * 404 (the review is gone) shows the message as a toast: the review area is asked again and
 * shows the current state. Other errors stay on the form.
 *
 * @param {{
 *   sellerId: string,
 *   review?: import('../../../api/types.js').Review,
 *   onDone?: () => void,
 * }} props
 */
export function ReviewForm({ sellerId, review, onDone }) {
  const toast = useToast();
  const [createReview] = useCreateReviewMutation();
  const [updateReview] = useUpdateReviewMutation();
  const [failure, setFailure] = useState(null);
  const titleId = useId();
  const ratingLabelId = useId();
  const ratingErrorId = useId();

  let defaultValues = { rating: null, comment: '' };
  if (review) defaultValues = { rating: review.rating, comment: review.comment ?? '' };

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(reviewSchema), mode: 'onTouched', defaultValues });
  const { field: ratingField } = useController({ name: 'rating', control });
  const comment = useWatch({ control, name: 'comment' });

  async function onSubmit(values) {
    setFailure(null);
    try {
      if (review) {
        await updateReview({ reviewId: review.id, sellerId, ...values }).unwrap();
        toast.show({ tone: 'success', message: text.updated });
        if (onDone) onDone();
        return;
      }
      await createReview({ sellerId, ...values }).unwrap();
      toast.show({ tone: 'success', message: text.created });
    } catch (error) {
      const problem = toProblem(error);
      // The seller was banned or deleted: the seller page is asked again and shows «البائع غير موجود».
      if (problem.code === 'Seller.NotFound') {
        toast.show({ tone: 'error', message: ar.sellers.notFoundTitle });
        if (onDone) onDone();
        return;
      }
      if (problem.status === 409 || problem.status === 404) {
        toast.show({ tone: 'warning', message: problem.message });
        if (onDone) onDone();
        return;
      }
      // 400 on the fields, 429 and the rest above the button.
      const { formMessage } = applyServerErrors(error, setError, FIELD_NAMES);
      let requestId = null;
      if (problem.status >= 500) requestId = problem.requestId;
      setFailure({ message: formMessage, requestId });
    }
  }

  let title = text.formTitle;
  let submitLabel = text.submit;
  if (review) {
    title = text.editTitle;
    submitLabel = text.save;
  }

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-lg border border-border bg-raised p-4 xl:px-[22px] xl:py-5"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <h3 id={titleId} className="text-[16px] leading-[1.72] font-bold text-text">
          {title}
        </h3>

        <div className="flex flex-col gap-1.5">
          <p id={ratingLabelId} className="text-[13.5px] leading-[1.72] font-semibold text-text">
            {text.ratingField}
          </p>
          <StarRatingInput
            inputRef={ratingField.ref}
            value={ratingField.value}
            onChange={ratingField.onChange}
            onBlur={ratingField.onBlur}
            labelId={ratingLabelId}
            invalid={Boolean(errors.rating)}
            describedBy={errors.rating ? ratingErrorId : undefined}
          />
          {errors.rating && (
            <p id={ratingErrorId} className="text-caption text-danger">
              {errors.rating.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <ListingTextarea
            label={text.commentLabel}
            placeholder={text.commentPlaceholder}
            maxLength={MAX_REVIEW_COMMENT_LENGTH}
            rows={3}
            error={errors.comment?.message}
            {...register('comment')}
          />
          <p className="text-end text-[12px] leading-[1.78] text-muted" aria-live="polite">
            <span dir="ltr">{`${comment.length} / ${MAX_REVIEW_COMMENT_LENGTH}`}</span>
          </p>
        </div>

        {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}

        <div className="flex gap-2.5">
          {review && (
            <Button variant="secondary" onClick={onDone} disabled={isSubmitting}>
              {ar.common.cancel}
            </Button>
          )}
          <Button type="submit" loading={isSubmitting} className="flex-1 xl:flex-none">
            {submitLabel}
          </Button>
        </div>
      </form>
    </section>
  );
}
