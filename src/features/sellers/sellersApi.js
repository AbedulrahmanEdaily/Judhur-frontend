import { baseApi } from '../../api/baseApi.js';
import { SELLERS_PATH } from '../../api/baseQuery.js';

// Public seller page (the project guide 6.13), open to everyone.
export const sellersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** 200 → SellerProfile (never the email or the phone). 404 `Seller.NotFound`. */
    getSellerById: builder.query({
      query: (sellerId) => `${SELLERS_PATH}/${encodeURIComponent(sellerId)}`,
      providesTags: (_result, _error, sellerId) => [{ type: 'SellerProfile', id: sellerId }],
    }),
  }),
});

export const { useGetSellerByIdQuery } = sellersApi;
