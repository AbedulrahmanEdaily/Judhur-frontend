import { baseApi } from '../../api/baseApi.js';
import { ADMIN_PROPERTIES_PATH } from '../../api/baseQuery.js';

/** `/api/v1/Admin/Properties/{id}` with the id made safe for a URL. */
function adminPropertyPath(propertyId) {
  return `${ADMIN_PROPERTIES_PATH}/${encodeURIComponent(propertyId)}`;
}

/** What a decision makes stale: the queue, this review, and the public search and details. */
function decisionTags(propertyId) {
  return [
    'PendingProperties',
    { type: 'ReviewProperty', id: propertyId },
    { type: 'Property', id: propertyId },
    { type: 'Property', id: 'LIST' },
  ];
}

// Admin moderation (the project guide 6.10), role Admin: 401 without a token, 403 for users.
export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * 200 → PaginatedList<PendingProperty>, oldest first. Only Pending listings that pass the
     * readiness checklist are in it.
     */
    getPendingProperties: builder.query({
      query: ({ page, pageSize }) => ({
        url: `${ADMIN_PROPERTIES_PATH}/pending`,
        params: { page, pageSize },
      }),
      providesTags: ['PendingProperties'],
    }),

    /**
     * 200 → ReviewProperty (any moderation state). The document link is valid for 10 minutes,
     * so this is never kept once the page is left.
     */
    getReviewProperty: builder.query({
      query: (propertyId) => adminPropertyPath(propertyId),
      providesTags: (_result, _error, propertyId) => [{ type: 'ReviewProperty', id: propertyId }],
      keepUnusedDataFor: 0,
    }),

    /** 204. 400 MinImagesRequired / MainImageRequired / OwnershipDocumentRequired, 409 approved. */
    approveProperty: builder.mutation({
      query: (propertyId) => ({ url: `${adminPropertyPath(propertyId)}/approve`, method: 'POST' }),
      invalidatesTags: (_result, _error, propertyId) => decisionTags(propertyId),
    }),

    /** Body: { rejectionReason } (≤ 500). 204. 409 when approved or already rejected. */
    rejectProperty: builder.mutation({
      query: ({ propertyId, rejectionReason }) => ({
        url: `${adminPropertyPath(propertyId)}/reject`,
        method: 'POST',
        body: { rejectionReason },
      }),
      invalidatesTags: (_result, _error, { propertyId }) => decisionTags(propertyId),
    }),
  }),
});

export const {
  useGetPendingPropertiesQuery,
  useGetReviewPropertyQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
} = adminApi;
