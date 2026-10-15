import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import { IconNoteInfo } from '../../../components/icons/index.js';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { loginPathFor } from '../../../routes/redirect.js';
import { selectCurrentUser, selectIsAuthenticated } from '../../auth/authSlice.js';
import { useGetMyReviewStatusQuery } from '../reviewsApi.js';
import { MyReviewCard } from './MyReviewCard.jsx';
import { ReviewForm } from './ReviewForm.jsx';

const text = ar.reviews;

const noteClasses =
  'flex items-center gap-2.5 rounded-lg border border-border bg-raised p-4 text-[13.5px] leading-[1.72] text-text-secondary xl:px-[22px]';

/**
 * My part of «التقييمات» (the project guide 6.18): a guest gets a login link that comes back
 * here; a user who is not this seller gets their review card (edit / delete), the review form
 * when `canReview`, or the hint that a review comes after a conversation. Admins and the seller
 * themself get nothing.
 *
 * @param {{ sellerId: string }} props
 */
export function MyReviewArea({ sellerId }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  // Only users review (admins never do), and never themselves.
  const isUser = Boolean(user?.roles.includes('User')) && !user.roles.includes('Admin');
  const canAsk = isAuthenticated && isUser && user.id !== sellerId;
  const status = useGetMyReviewStatusQuery(sellerId, { skip: !canAsk });

  if (!isAuthenticated) {
    return (
      <p className={noteClasses}>
        <IconNoteInfo className="shrink-0 text-muted" />
        <Link
          to={loginPathFor(location)}
          className="font-semibold text-brand-text underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {text.loginToReview}
        </Link>
      </p>
    );
  }

  if (!canAsk) return null;

  if (status.isLoading) return <Skeleton className="h-28 rounded-lg" />;

  if (status.error) {
    const problem = toProblem(status.error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    return <ErrorState message={problem.message} requestId={requestId} onRetry={status.refetch} />;
  }

  const { review, canReview } = status.data;

  if (review && isEditing) {
    return <ReviewForm sellerId={sellerId} review={review} onDone={() => setIsEditing(false)} />;
  }
  if (review) {
    return <MyReviewCard sellerId={sellerId} review={review} onEdit={() => setIsEditing(true)} />;
  }
  if (canReview) return <ReviewForm sellerId={sellerId} />;

  return (
    <p className={noteClasses}>
      <IconNoteInfo className="shrink-0 text-muted" />
      {text.notEligibleHint}
    </p>
  );
}
