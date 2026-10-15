import { baseApi } from '../../api/baseApi.js';
import { ADMIN_PROPERTIES_PATH, ADMIN_REPORTS_PATH } from '../../api/baseQuery.js';

/** `/api/v1/Admin/Properties/{id}` with the id made safe for a URL. */
function adminPropertyPath(propertyId) {
  return `${ADMIN_PROPERTIES_PATH}/${encodeURIComponent(propertyId)}`;
}

/** What a decision makes stale: the queue, this review, and the public search and details. */
function decisionTags(propertyId) {
  return [
    'PendingProperties',
    'AdminStats',
    { type: 'ReviewProperty', id: propertyId },
    { type: 'Property', id: propertyId },
    { type: 'Property', id: 'LIST' },
  ];
}

/** `/api/v1/Admin/Reports/{id}` with the id made safe for a URL. */
function adminReportPath(reportId) {
  return `${ADMIN_REPORTS_PATH}/${encodeURIComponent(reportId)}`;
}

/** What a report decision makes stale; suspending also hides the listing from the public. */
function reportDecisionTags(reportId, propertyId, suspended) {
  const tags = ['AdminReports', { type: 'AdminReport', id: reportId }, 'AdminStats'];
  if (suspended) {
    tags.push(
      { type: 'Property', id: propertyId },
      { type: 'Property', id: 'LIST' },
      { type: 'ReviewProperty', id: propertyId },
      'PendingProperties',
    );
  }
  return tags;
}

// Admin moderation (the project guide 6.10) and reports (6.15), role Admin: 401 without a
// token, 403 for users.
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

    /**
     * Body: { rowVersion } — what was reviewed. 204. 400 MinImagesRequired / MainImageRequired /
     * OwnershipDocumentRequired, 409 Properties.ChangedSinceReview or already approved.
     */
    approveProperty: builder.mutation({
      query: ({ propertyId, rowVersion }) => ({
        url: `${adminPropertyPath(propertyId)}/approve`,
        method: 'POST',
        body: { rowVersion },
      }),
      invalidatesTags: (_result, _error, { propertyId }) => decisionTags(propertyId),
    }),

    /**
     * Body: { rejectionReason (≤ 500), rowVersion }. 204. 409 Properties.ChangedSinceReview, or
     * approved / already rejected.
     */
    rejectProperty: builder.mutation({
      query: ({ propertyId, rejectionReason, rowVersion }) => ({
        url: `${adminPropertyPath(propertyId)}/reject`,
        method: 'POST',
        body: { rejectionReason, rowVersion },
      }),
      invalidatesTags: (_result, _error, { propertyId }) => decisionTags(propertyId),
    }),

    /** `?status=Pending|Resolved|Dismissed&page=&pageSize=` → PaginatedList<ReportSummary>. */
    getAdminReports: builder.query({
      query: ({ status, page, pageSize }) => ({
        url: ADMIN_REPORTS_PATH,
        params: { status, page, pageSize },
      }),
      providesTags: ['AdminReports'],
    }),

    /** 200 → ReportDetails (any status). 404 missing. */
    getAdminReport: builder.query({
      query: (reportId) => adminReportPath(reportId),
      providesTags: (_result, _error, reportId) => [{ type: 'AdminReport', id: reportId }],
    }),

    /** Body: { adminNote } (≤ 1000, optional). 204; closes this report only. */
    dismissReport: builder.mutation({
      query: ({ reportId, adminNote }) => ({
        url: `${adminReportPath(reportId)}/dismiss`,
        method: 'POST',
        body: { adminNote },
      }),
      invalidatesTags: (_result, _error, { reportId }) => reportDecisionTags(reportId),
    }),

    /**
     * Body: { adminNote, suspendProperty, suspensionReason } — the reason (≤ 500) only when
     * suspending. 204; closes every pending report on the listing. 409
     * ReportErrors.AlreadyReviewed.
     */
    resolveReport: builder.mutation({
      query: ({ reportId, adminNote, suspendProperty, suspensionReason }) => {
        const body = { adminNote, suspendProperty };
        if (suspendProperty) body.suspensionReason = suspensionReason;
        return { url: `${adminReportPath(reportId)}/resolve`, method: 'POST', body };
      },
      invalidatesTags: (_result, _error, { reportId, propertyId, suspendProperty }) =>
        reportDecisionTags(reportId, propertyId, suspendProperty),
    }),
  }),
});

/**
 * The queue rows have no rowVersion: a quick decision from the queue reads the current one from
 * the review endpoint first.
 *
 * @param {(action: any) => any} dispatch
 * @param {string} propertyId
 * @returns {Promise<string>}
 */
export async function fetchRowVersion(dispatch, propertyId) {
  const request = dispatch(
    adminApi.endpoints.getReviewProperty.initiate(propertyId, {
      subscribe: false,
      forceRefetch: true,
    }),
  );
  const review = await request.unwrap();
  return review.rowVersion;
}

export const {
  useGetPendingPropertiesQuery,
  useGetReviewPropertyQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  useGetAdminReportsQuery,
  useGetAdminReportQuery,
  useDismissReportMutation,
  useResolveReportMutation,
} = adminApi;
