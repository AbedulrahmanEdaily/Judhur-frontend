import { useId, useState } from 'react';
import { IconTrash } from '../../../components/icons/index.js';
import { Button } from '../../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.jsx';
import { StarRating } from '../../../components/ui/StarRating.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { formatRelativeTime } from '../../../lib/format.js';
import { actionErrorMessage } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { useDeleteReviewMutation } from '../reviewsApi.js';

const text = ar.reviews;

/**
 * «تقييمك» (not in Figma — the review card on brand/subtle with a brand border): my stars, my
 * comment and the date, then «تعديل» (opens the same form) and «حذف» behind the confirm dialog.
 * A 404 on delete means it is already gone: the review area is asked again either way.
 *
 * @param {{
 *   sellerId: string,
 *   review: import('../../../api/types.js').Review,
 *   onEdit: () => void,
 * }} props
 */
export function MyReviewCard({ sellerId, review, onEdit }) {
  const toast = useToast();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const titleId = useId();

  async function confirmDelete() {
    try {
      await deleteReview({ reviewId: review.id, sellerId }).unwrap();
      toast.show({ tone: 'success', message: text.deleted });
    } catch (error) {
      toast.show({ tone: 'error', message: actionErrorMessage(error) });
    }
    setIsConfirmOpen(false);
  }

  const isEdited = review.lastModifiedUtc !== review.createdAtUtc;

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-2.5 rounded-lg border border-brand bg-brand-subtle p-4 xl:px-[22px] xl:py-5"
    >
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <h3 id={titleId} className="text-[15px] leading-[1.74] font-bold text-text">
          {text.myReviewTitle}
        </h3>
        <StarRating value={review.rating} />
        <p className="ms-auto text-[12px] leading-[1.74] text-muted">
          <time dateTime={review.createdAtUtc}>{formatRelativeTime(review.createdAtUtc)}</time>
          {isEdited && <span className="ms-1">{text.edited}</span>}
        </p>
      </div>
      {review.comment && (
        <p className="text-[13.5px] leading-[1.74] whitespace-pre-line text-text-secondary">
          {review.comment}
        </p>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onEdit}>
          {text.edit}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsConfirmOpen(true)}
          className="gap-1.5"
        >
          <IconTrash width={15} height={15} className="text-danger" />
          {text.delete}
        </Button>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={text.deleteTitle}
        description={text.deleteText}
        confirmLabel={text.deleteConfirm}
        loading={isDeleting}
      />
    </section>
  );
}
