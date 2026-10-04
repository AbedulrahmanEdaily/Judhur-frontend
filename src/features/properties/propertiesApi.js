import { baseApi } from '../../api/baseApi.js';
import { USER_PROPERTIES_PATH } from '../../api/baseQuery.js';

/** `/api/v1/User/Properties/{id}` with the id made safe for a URL. */
function propertyPath(propertyId) {
  return `${USER_PROPERTIES_PATH}/${encodeURIComponent(propertyId)}`;
}

/**
 * What a seller change on one listing makes stale: the owner list and page, and the public
 * search and details (the server clears its own cache at the same time).
 */
function sellerChangeTags(propertyId) {
  return [
    'MyProperties',
    { type: 'MyProperty', id: propertyId },
    { type: 'Property', id: propertyId },
    { type: 'Property', id: 'LIST' },
    // The public seller page counts the seller's listings.
    'SellerProfile',
  ];
}

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Public search (guests too). 200 → PaginatedList<PropertySummary>. 400 bad page/pageSize.
     * `queryString` holds only the filters that are set (toApiQuery in searchFilters.js).
     */
    getProperties: builder.query({
      query: (queryString) => `${USER_PROPERTIES_PATH}?${queryString}`,
      providesTags: [{ type: 'Property', id: 'LIST' }],
    }),

    /**
     * Public details. 200 → PropertyDetails; `user.phoneNumber` only when signed in.
     * 404 when missing, not approved, or inactive.
     */
    getPropertyById: builder.query({
      query: (propertyId) => propertyPath(propertyId),
      providesTags: (_result, _error, propertyId) => [{ type: 'Property', id: propertyId }],
    }),

    // --- Seller (role User): 401 without a token, 403 for admins, 404 also for another
    // user's listing (the project guide 6.6–6.8).

    /** 200 → MyProperty[] (not paginated, newest first, every moderation state). */
    getMyProperties: builder.query({
      query: () => `${USER_PROPERTIES_PATH}/mine`,
      providesTags: ['MyProperties'],
      // Not cached on the server, and moderation changes elsewhere: always fresh on a new visit.
      refetchOnMountOrArgChange: true,
    }),

    /** 200 → MyPropertyDetails. 404 missing or not owned. */
    getMyProperty: builder.query({
      query: (propertyId) => `${USER_PROPERTIES_PATH}/mine/${encodeURIComponent(propertyId)}`,
      providesTags: (_result, _error, propertyId) => [{ type: 'MyProperty', id: propertyId }],
      refetchOnMountOrArgChange: true,
    }),

    /**
     * Body: CreatePropertyRequest. 201 → the details shape with `id` (`Location` points to
     * `GET /mine/{id}`); the listing is Pending.
     */
    createProperty: builder.mutation({
      query: (body) => ({ url: USER_PROPERTIES_PATH, method: 'POST', body }),
      invalidatesTags: ['MyProperties'],
    }),

    /** Body: UpdatePropertyDetailsRequest. 204. Sends the listing back to Pending. */
    updatePropertyDetails: builder.mutation({
      query: ({ propertyId, ...body }) => ({
        url: `${propertyPath(propertyId)}/details`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { propertyId }) => sellerChangeTags(propertyId),
    }),

    /** 204. `description: null` clears it. Moderation does not change. */
    updatePropertyDescription: builder.mutation({
      query: ({ propertyId, description }) => ({
        url: `${propertyPath(propertyId)}/description`,
        method: 'PUT',
        body: { description },
      }),
      invalidatesTags: (_result, _error, { propertyId }) => sellerChangeTags(propertyId),
    }),

    /**
     * multipart: `file` (JPG/PNG/WEBP ≤ 5 MB), `isMainImage`. 200 → PropertyImage.
     * Call one at a time: parallel uploads can collide on the image order (409). On an approved
     * listing it sends the listing back to Pending. 400 `Storage.InvalidFileContent` when the
     * content does not match the type.
     */
    uploadPropertyImage: builder.mutation({
      query: ({ propertyId, file, isMainImage = false }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isMainImage', String(isMainImage));
        return { url: `${propertyPath(propertyId)}/images`, method: 'POST', body: formData };
      },
      invalidatesTags: (_result, _error, { propertyId }) => sellerChangeTags(propertyId),
    }),

    /** 204. 400 CannotRemoveMainImage / MinImagesRequired (approved listings keep 3). */
    deletePropertyImage: builder.mutation({
      query: ({ propertyId, imageId }) => ({
        url: `${propertyPath(propertyId)}/images/${encodeURIComponent(imageId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { propertyId }) => sellerChangeTags(propertyId),
    }),

    /** 204. On an approved listing it sends the listing back to Pending. */
    setMainPropertyImage: builder.mutation({
      query: ({ propertyId, imageId }) => ({
        url: `${propertyPath(propertyId)}/images/${encodeURIComponent(imageId)}/main`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { propertyId }) => sellerChangeTags(propertyId),
    }),

    /**
     * multipart: `file` (PDF/JPG/JPEG/PNG/WEBP ≤ 10 MB). 204. Replaces the old document; on an
     * approved or rejected listing it sends the listing back to Pending.
     */
    uploadOwnershipDocument: builder.mutation({
      query: ({ propertyId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `${propertyPath(propertyId)}/ownership-document`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { propertyId }) => sellerChangeTags(propertyId),
    }),

    /**
     * The lifecycle actions (6.8), all `POST` with no body → 204, 409 when not allowed now.
     * `action`: 'deactivate' | 'reactivate' | 'resubmit' | 'mark-sold' | 'mark-rented'.
     */
    changePropertyState: builder.mutation({
      query: ({ propertyId, action }) => ({
        url: `${propertyPath(propertyId)}/${action}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { propertyId }) => sellerChangeTags(propertyId),
    }),

    /**
     * 204, soft delete. The owner page of this id is not refetched (it would 404); the caller
     * navigates away.
     */
    deleteProperty: builder.mutation({
      query: (propertyId) => ({ url: propertyPath(propertyId), method: 'DELETE' }),
      invalidatesTags: (_result, _error, propertyId) => [
        'MyProperties',
        { type: 'Property', id: propertyId },
        { type: 'Property', id: 'LIST' },
        'SellerProfile',
      ],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useGetMyPropertiesQuery,
  useGetMyPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyDetailsMutation,
  useUpdatePropertyDescriptionMutation,
  useUploadPropertyImageMutation,
  useDeletePropertyImageMutation,
  useSetMainPropertyImageMutation,
  useUploadOwnershipDocumentMutation,
  useChangePropertyStateMutation,
  useDeletePropertyMutation,
} = propertiesApi;
