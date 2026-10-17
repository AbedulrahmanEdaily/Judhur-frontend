import { baseApi } from '../../api/baseApi.js';
import { REVIEWS_PATH, SELLERS_PATH } from '../../api/baseQuery.js';

/** Everything that shows a seller's rating: the seller page, the reviews, my review, details. */
function reviewChangedTags(sellerId) {
  return [
    { type: 'SellerProfile', id: sellerId },
    { type: 'SellerReviews', id: sellerId },
    { type: 'MyReviewStatus', id: sellerId },
    'Property',
  ];
}

/**
 * After a mutation: on success every rating view; on a 409 (already reviewed, not eligible any
 * more, or a database conflict) or a 404 (the review is gone) the state changed elsewhere, so
 * the review area and the list are asked again.
 */
function tagsAfterReviewChange(error, sellerId) {
  if (!error) return reviewChangedTags(sellerId);
  if (error.status === 409 || error.status === 404) return reviewChangedTags(sellerId);
  return [];
}

function tagsAfterReviewSaved(error, sellerId) {
  const tags = tagsAfterReviewChange(error, sellerId);
  if (error) return tags;
  return tags.filter((tag) => tag.type !== 'MyReviewStatus');
}

async function keepSavedReview(sellerId, { dispatch, queryFulfilled }) {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      reviewsApi.util.updateQueryData('getMyReviewStatus', sellerId, (status) => {
        status.review = data;
      }),
    );
  } catch {
    return;
  }
}

// Seller reviews (the project guide 6.18).
export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Public. 200 → PaginatedList<SellerReview>, newest first. */
    getSellerReviews: builder.query({
      query: ({ sellerId, page, pageSize }) => ({
        url: `${SELLERS_PATH}/${encodeURIComponent(sellerId)}/reviews`,
        params: { page, pageSize },
      }),
      providesTags: (_result, _error, { sellerId }) => [{ type: 'SellerReviews', id: sellerId }],
    }),

    /** Role User. 200 → { canReview, review? } — my review of this seller, or whether I may write one. */
    getMyReviewStatus: builder.query({
      query: (sellerId) => `${REVIEWS_PATH}/sellers/${encodeURIComponent(sellerId)}/mine`,
      providesTags: (_result, _error, sellerId) => [{ type: 'MyReviewStatus', id: sellerId }],
    }),

    /**
     * Body: { sellerId, rating, comment? }. 201 → Review, written into my review status. 409
     * ReviewErrors.NotEligible / DuplicateReview / CannotReviewSelf · 404 Seller.NotFound · 429.
     */
    createReview: builder.mutation({
      query: (body) => ({ url: REVIEWS_PATH, method: 'POST', body }),
      onQueryStarted: ({ sellerId }, api) => keepSavedReview(sellerId, api),
      invalidatesTags: (_result, error, { sellerId }) => tagsAfterReviewSaved(error, sellerId),
    }),

    /** Body: { rating, comment? }. 200 → Review, written into my review status. 404 the review is gone. */
    updateReview: builder.mutation({
      query: ({ reviewId, rating, comment }) => ({
        url: `${REVIEWS_PATH}/${encodeURIComponent(reviewId)}`,
        method: 'PUT',
        body: { rating, comment },
      }),
      onQueryStarted: ({ sellerId }, api) => keepSavedReview(sellerId, api),
      invalidatesTags: (_result, error, { sellerId }) => tagsAfterReviewSaved(error, sellerId),
    }),

    /** 204. 404 the review is gone. */
    deleteReview: builder.mutation({
      query: ({ reviewId }) => ({
        url: `${REVIEWS_PATH}/${encodeURIComponent(reviewId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, error, { sellerId }) => tagsAfterReviewChange(error, sellerId),
    }),
  }),
});

export const {
  useGetSellerReviewsQuery,
  useGetMyReviewStatusQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;
