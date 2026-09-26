import { baseApi } from '../../api/baseApi.js';
import { ACCOUNT_PATH } from '../../api/baseQuery.js';
import { sessionStarted } from './authSlice.js';
import { setRememberSession } from './authStorage.js';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * 200 → TokenResponse; starts the session. 401 wrong credentials · 403 unconfirmed/locked.
     * `remember` ("تذكّرني") only decides where the session is stored; it is not sent.
     */
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: `${ACCOUNT_PATH}/login`,
        method: 'POST',
        body: { email, password },
      }),
      async onQueryStarted({ remember }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          setRememberSession(remember !== false);
          dispatch(sessionStarted(data));
        } catch {
          // The page shows the error.
        }
      },
    }),

    /** 201, empty body — a confirmation email is sent. 409 duplicate email/user name. */
    register: builder.mutation({
      query: (body) => ({ url: `${ACCOUNT_PATH}/register`, method: 'POST', body }),
    }),

    /** 204 confirmed · 400 link invalid or expired. */
    confirmEmail: builder.mutation({
      query: (body) => ({ url: `${ACCOUNT_PATH}/confirm-email`, method: 'POST', body }),
    }),

    /** Always 204. Rate limited → 429. */
    resendConfirmation: builder.mutation({
      query: (body) => ({ url: `${ACCOUNT_PATH}/resend-confirmation`, method: 'POST', body }),
    }),

    /** Always 204; a 6-digit code valid for 5 minutes is emailed. Rate limited → 429. */
    sendResetPasswordCode: builder.mutation({
      query: (body) => ({ url: `${ACCOUNT_PATH}/send-reset-password-code`, method: 'POST', body }),
    }),

    /** Reset password with the emailed code. 204 · 400 wrong/expired code. Rate limited → 429. */
    changePassword: builder.mutation({
      query: (body) => ({ url: `${ACCOUNT_PATH}/change-password`, method: 'POST', body }),
    }),

    /** Always 204. */
    logout: builder.mutation({
      query: (body) => ({ url: `${ACCOUNT_PATH}/logout`, method: 'POST', body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useResendConfirmationMutation,
  useSendResetPasswordCodeMutation,
  useChangePasswordMutation,
  useLogoutMutation,
} = authApi;
