import { baseApi } from '../../api/baseApi.js';
import { ACCOUNT_PATH } from '../../api/baseQuery.js';
import { sessionStarted } from './authSlice.js';

const post = (path) => (body) => ({ url: `${ACCOUNT_PATH}${path}`, method: 'POST', body });

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** 200 → TokenResponse; starts the session. 401 wrong credentials · 403 unconfirmed/locked. */
    login: builder.mutation({
      query: post('/login'),
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(sessionStarted(data));
        } catch {
          // The page shows the error.
        }
      },
    }),
    /** 201, empty body — a confirmation email is sent. 409 duplicate email/user name. */
    register: builder.mutation({ query: post('/register') }),
    /** 204 confirmed · 400 link invalid or expired. */
    confirmEmail: builder.mutation({ query: post('/confirm-email') }),
    /** Always 204. Rate limited → 429. */
    resendConfirmation: builder.mutation({ query: post('/resend-confirmation') }),
    /** Always 204; a 6-digit code valid for 5 minutes is emailed. Rate limited → 429. */
    sendResetPasswordCode: builder.mutation({ query: post('/send-reset-password-code') }),
    /** Reset password with the emailed code. 204 · 400 wrong/expired code. Rate limited → 429. */
    changePassword: builder.mutation({ query: post('/change-password') }),
    /** Always 204. */
    logout: builder.mutation({ query: post('/logout') }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useConfirmEmailMutation,
  useResendConfirmationMutation,
  useSendResetPasswordCodeMutation,
  useChangePasswordMutation,
  useLogoutMutation,
} = authApi;
