import { baseApi } from '../../api/baseApi.js';
import { ACCOUNT_PATH } from '../../api/baseQuery.js';

const ME_PATH = `${ACCOUNT_PATH}/me`;

/** Changes the cached profile in place (the server already sent the new values). */
function patchMyProfile(dispatch, change) {
  dispatch(profileApi.util.updateQueryData('getMe', undefined, change));
}

// My profile (the project guide 6.12), token required, any role.
export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** 200 → MyProfile. Read through useMyProfile, once for the whole app. */
    getMe: builder.query({
      query: () => ME_PATH,
      providesTags: ['MyProfile'],
    }),

    /**
     * 200 → the updated MyProfile, written into the getMe cache instead of a refetch.
     * 400 validation · 409 `Identity.ConcurrencyFailure` (try again).
     */
    updateMyProfile: builder.mutation({
      query: (body) => ({ url: ME_PATH, method: 'PUT', body }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          patchMyProfile(dispatch, () => data);
        } catch {
          // The form shows the error.
        }
      },
      // The seller box on listings and the public seller page show the name.
      invalidatesTags: (result) => (result ? ['Property', 'SellerProfile'] : []),
    }),

    /** multipart `file` (JPG/PNG/WEBP, ≤5 MB). 200 → { profileImageUrl }. */
    uploadMyPhoto: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: `${ME_PATH}/photo`, method: 'PUT', body: formData };
      },
      async onQueryStarted(file, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          patchMyProfile(dispatch, (profile) => {
            profile.profileImageUrl = data.profileImageUrl;
          });
        } catch {
          // The page shows the error.
        }
      },
      invalidatesTags: (result) => (result ? ['Property', 'SellerProfile'] : []),
    }),

    /** 204. */
    deleteMyPhoto: builder.mutation({
      query: () => ({ url: `${ME_PATH}/photo`, method: 'DELETE' }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          patchMyProfile(dispatch, (profile) => {
            profile.profileImageUrl = null;
          });
        } catch {
          // The page shows the error.
        }
      },
      invalidatesTags: (result, error) => (error ? [] : ['Property', 'SellerProfile']),
    }),

    /**
     * 204; the session stays valid. 400 `Identity.CurrentPasswordRequired` /
     * `Identity.PasswordMismatch` · 429 after 5 tries in 15 minutes. An account without a
     * password (Google) sets its first one, and `hasPassword` becomes true.
     */
    /**
     * Body: { newEmail, password? } (the password when the account has one). 204: a link is
     * sent to the new email; nothing changes before it is opened. 400 Identity.EmailUnchanged /
     * CurrentPasswordRequired / InvalidPassword · 409 Identity.DuplicateEmail · 429.
     */
    changeMyEmail: builder.mutation({
      query: (body) => ({ url: `${ME_PATH}/email`, method: 'POST', body }),
    }),

    /**
     * Body: { password } when the account has one, none for a Google-only account. 204: the
     * account is gone (the caller ends the session). 400 CurrentPasswordRequired /
     * InvalidPassword · 409 Users.AdminCannotDeleteAccount · 429.
     */
    deleteMyAccount: builder.mutation({
      query: (password) => {
        const request = { url: ME_PATH, method: 'DELETE' };
        if (password) request.body = { password };
        return request;
      },
    }),

    changeMyPassword: builder.mutation({
      query: (body) => ({ url: `${ME_PATH}/password`, method: 'PUT', body }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          patchMyProfile(dispatch, (profile) => {
            profile.hasPassword = true;
          });
        } catch {
          // The form shows the error.
        }
      },
    }),
  }),
});

export const {
  useChangeMyEmailMutation,
  useDeleteMyAccountMutation,
  useGetMeQuery,
  useUpdateMyProfileMutation,
  useUploadMyPhotoMutation,
  useDeleteMyPhotoMutation,
  useChangeMyPasswordMutation,
} = profileApi;
