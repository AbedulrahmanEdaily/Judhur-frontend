import { baseApi } from '../../api/baseApi.js';
import { ACCOUNT_PATH } from '../../api/baseQuery.js';
import { profileApi } from '../profile/profileApi.js';
import { sessionStarted } from './authSlice.js';
import { setRememberSession } from './authStorage.js';

/** Starts the session and loads the new user's profile (name and photo for the header) at once. */
function startSession(dispatch, tokens) {
  dispatch(sessionStarted(tokens));
  dispatch(profileApi.endpoints.getMe.initiate(undefined, { subscribe: false }));
}

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
          startSession(dispatch, data);
        } catch {
          // The page shows the error.
        }
      },
    }),

    /**
     * Sign in with Google: `idToken` is the credential from Google's button. 200 → TokenResponse,
     * the session starts like a normal login. 400 `Identity.GoogleRegistrationIncomplete` → a
     * first-time Google user: send the same idToken again with `phoneNumber` and `city`.
     * 401 the Google token could not be verified · 403 unverified Google email or locked account.
     */
    googleSignIn: builder.mutation({
      query: ({ idToken, phoneNumber, city }) => {
        const body = { idToken };
        if (phoneNumber) body.phoneNumber = phoneNumber;
        if (city) body.city = city;
        return { url: `${ACCOUNT_PATH}/google`, method: 'POST', body };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          setRememberSession(true);
          startSession(dispatch, data);
        } catch {
          // The page shows the error.
        }
      },
    }),

    /** 201, empty body — a confirmation email is sent. 409 `Identity.DuplicateEmail`. */
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
  useGoogleSignInMutation,
  useRegisterMutation,
  useResendConfirmationMutation,
  useSendResetPasswordCodeMutation,
  useChangePasswordMutation,
  useLogoutMutation,
} = authApi;
