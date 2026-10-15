import { Avatar } from '../../../components/ui/Avatar.jsx';
import { StarRating } from '../../../components/ui/StarRating.jsx';
import { formatRelativeTime } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';

const text = ar.reviews;

/**
 * One review — Figma review card (73:1610): bg/raised, border/subtle, radius lg, 22×20 (16 on
 * phones); the head row with the 34px avatar, the name 14.5 semibold, five 13px stars and the
 * relative date 12 muted at the end; the comment 13.5 text/secondary under it. Not in Figma:
 * «(معدّل)» after the date and «مستخدم محذوف» for a deleted reviewer.
 *
 * @param {{ review: import('../../../api/types.js').SellerReview }} props
 */
export function SellerReviewItem({ review }) {
  let name = text.deletedUser;
  if (review.reviewer) name = review.reviewer.fullName;

  return (
    <article className="flex flex-col gap-2.5 rounded-lg border border-border bg-raised p-4 xl:px-[22px] xl:py-5">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <Avatar
          name={name}
          imageUrl={review.reviewer?.profileImageUrl}
          sizeClassName="size-[34px] text-[14px]"
        />
        <h3 className="text-[14.5px] leading-[1.74] font-semibold text-text">{name}</h3>
        <StarRating value={review.rating} />
        <p className="ms-auto text-[12px] leading-[1.74] text-muted">
          <time dateTime={review.createdAtUtc}>{formatRelativeTime(review.createdAtUtc)}</time>
          {review.isEdited && <span className="ms-1">{text.edited}</span>}
        </p>
      </div>
      {review.comment && (
        <p className="text-[13.5px] leading-[1.74] whitespace-pre-line text-text-secondary">
          {review.comment}
        </p>
      )}
    </article>
  );
}
