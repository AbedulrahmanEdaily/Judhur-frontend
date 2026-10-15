import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { REVIEWS_PAGE_SIZE } from '../constants.js';
import { useGetSellerReviewsQuery } from '../reviewsApi.js';
import { MyReviewArea } from './MyReviewArea.jsx';
import { SellerReviewItem } from './SellerReviewItem.jsx';

const text = ar.reviews;

/**
 * The «التقييمات» tab of the seller page — Figma «التقييمات» (73:1608): my review area first,
 * then the review cards 14 apart (newest first, 10 per page) with pagination.
 *
 * @param {{ sellerId: string, page: number, onPageChange: (page: number) => void }} props
 */
export function SellerReviewsTab({ sellerId, page, onPageChange }) {
  const { data, isLoading, error, refetch } = useGetSellerReviewsQuery({
    sellerId,
    page,
    pageSize: REVIEWS_PAGE_SIZE,
  });

  let list;
  if (isLoading) {
    list = (
      <div className="flex flex-col gap-3.5">
        <Skeleton className="h-[107px] rounded-lg" />
        <Skeleton className="h-[107px] rounded-lg" />
        <Skeleton className="h-[107px] rounded-lg" />
      </div>
    );
  } else if (error) {
    const problem = toProblem(error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    list = <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />;
  } else if (data.items.length === 0 && page > 1) {
    list = (
      <EmptyState
        title={text.noReviews}
        action={{ label: text.previousPage, onClick: () => onPageChange(page - 1) }}
      />
    );
  } else if (data.items.length === 0) {
    list = <EmptyState title={text.noReviews} description={text.emptyText} />;
  } else {
    list = (
      <>
        <ul className="flex flex-col gap-3.5">
          {data.items.map((review) => (
            <li key={review.id}>
              <SellerReviewItem review={review} />
            </li>
          ))}
        </ul>
        <Pagination
          page={data.pageNumber}
          totalPages={data.totalPages}
          onPageChange={onPageChange}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <MyReviewArea sellerId={sellerId} />
      {list}
    </div>
  );
}
