import { baseApi } from '../../api/baseApi.js';
import { USER_PROPERTIES_PATH } from '../../api/baseQuery.js';

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Public search (guests too). 200 → PaginatedList<PropertySummary>. 400 bad page/pageSize.
     * `params` holds only the filters that are set (see searchFilters.js).
     */
    getProperties: builder.query({
      query: (params) => ({ url: USER_PROPERTIES_PATH, params }),
      providesTags: [{ type: 'Property', id: 'LIST' }],
    }),

    /**
     * Public details. 200 → PropertyDetails; `user.phoneNumber` only when signed in.
     * 404 when missing, not approved, or inactive.
     */
    getPropertyById: builder.query({
      query: (propertyId) => `${USER_PROPERTIES_PATH}/${encodeURIComponent(propertyId)}`,
      providesTags: (_result, _error, propertyId) => [{ type: 'Property', id: propertyId }],
    }),
  }),
});

export const { useGetPropertiesQuery, useGetPropertyByIdQuery } = propertiesApi;
