import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { useToast } from '../../../components/ui/useToast.js';
import { ar } from '../../../locales/ar.js';
import { profileSchema } from '../../auth/schemas.js';
import { ListingInput } from '../../properties/components/ListingInput.jsx';
import { ListingTextarea } from '../../properties/components/ListingTextarea.jsx';
import { useUpdateMyProfileMutation } from '../profileApi.js';
import { ProfilePhotoRow } from './ProfilePhotoRow.jsx';
import { ProfileSubmitButton } from './ProfileSubmitButton.jsx';

const text = ar.profile;
const fields = ar.auth.fields;
const FIELD_NAMES = ['fullName', 'phoneNumber', 'city', 'bio'];

/** The form's values from the profile (missing keys are empty fields). */
function formValuesOf(profile) {
  return {
    fullName: profile.fullName,
    phoneNumber: profile.phoneNumber ?? '',
    city: profile.city,
    bio: profile.bio ?? '',
  };
}

/**
 * Figma «البيانات الشخصية» card (79:1619): raised, border/subtle, radius lg, 26×24, 18 gap —
 * the photo row, then name | city, email | phone in rows of two (14 gap), and «نبذة عنك».
 * `PUT /me` always gets all four fields; the answer replaces the cached profile. The email is
 * shown read-only (it is the login). «احفظ التعديلات» sits under the card.
 *
 * @param {{ profile: import('../../../api/types.js').MyProfile }} props
 */
export function ProfileDetailsForm({ profile }) {
  const toast = useToast();
  const [updateProfile] = useUpdateMyProfileMutation();
  const [failure, setFailure] = useState(null);
  const formId = useId();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    // Follows the cached profile (after a save), without wiping what the user is typing.
    values: formValuesOf(profile),
    resetOptions: { keepDirtyValues: true },
  });

  async function onSubmit(values) {
    setFailure(null);
    try {
      await updateProfile(values).unwrap();
      toast.show({ tone: 'success', message: text.saved });
    } catch (error) {
      // 409 Identity.ConcurrencyFailure lands here as a message; sending again retries.
      const { problem, formMessage } = applyServerErrors(error, setError, FIELD_NAMES);
      let requestId = null;
      if (problem.status >= 500) requestId = problem.requestId;
      setFailure({ message: formMessage, requestId });
    }
  }

  return (
    <div className="flex flex-col gap-4 xl:gap-5">
      <section className="flex flex-col gap-[18px] rounded-lg border border-border bg-raised px-4 py-5 xl:px-[26px] xl:py-6">
        <h2 className="text-[18px] leading-[1.72] font-bold text-text">{text.personalTitle}</h2>
        {/* Outside the form: the photo saves on its own, and its confirm dialog has a form. */}
        <ProfilePhotoRow profile={profile} />

        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-[18px]"
        >
          <div className="grid gap-[18px] sm:grid-cols-2 sm:gap-x-[14px]">
            <ListingInput
              label={fields.fullName}
              autoComplete="name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <ListingInput
              label={fields.city}
              autoComplete="address-level2"
              error={errors.city?.message}
              {...register('city')}
            />
            <ListingInput
              label={fields.email}
              type="email"
              value={profile.email}
              readOnly
              hint={text.emailReadOnly}
            />
            <ListingInput
              label={fields.phoneNumber}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              error={errors.phoneNumber?.message}
              {...register('phoneNumber')}
            />
          </div>

          <ListingTextarea
            label={text.bio}
            rows={3}
            maxLength={1000}
            error={errors.bio?.message}
            {...register('bio')}
          />
        </form>
      </section>

      {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}
      <ProfileSubmitButton form={formId} loading={isSubmitting}>
        {text.save}
      </ProfileSubmitButton>
    </div>
  );
}
