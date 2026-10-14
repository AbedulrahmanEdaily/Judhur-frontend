import { baseApi } from '../../api/baseApi.js';
import { USER_REPORTS_PATH } from '../../api/baseQuery.js';

// Reporting a listing (the project guide 6.15), role User: 401 without a token, 403 for admins.
export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Body: { propertyId, reason, details } — details ≤ 1000, required for Other. 201 → { id }.
     * 404 not public · 409 ReportErrors.CannotReportOwnProperty / ReportErrors.DuplicateReport ·
     * 429 after 10 an hour.
     */
    reportProperty: builder.mutation({
      query: (body) => ({ url: USER_REPORTS_PATH, method: 'POST', body }),
      invalidatesTags: ['MyReports'],
    }),

    /** 200 → PaginatedList<MyReport>, newest first. */
    getMyReports: builder.query({
      query: ({ page, pageSize }) => ({
        url: `${USER_REPORTS_PATH}/mine`,
        params: { page, pageSize },
      }),
      providesTags: ['MyReports'],
    }),
  }),
});

export const { useReportPropertyMutation, useGetMyReportsQuery } = reportsApi;
