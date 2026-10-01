import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { useToast } from '../../../components/ui/useToast.js';
import { ar } from '../../../locales/ar.js';
import { PasswordRules } from '../../auth/components/PasswordRules.jsx';
import { changePasswordSchema, setPasswordSchema } from '../../auth/schemas.js';
import { useChangeMyPasswordMutation } from '../profileApi.js';
import { ProfilePasswordInput } from './ProfilePasswordInput.jsx';
import { ProfileSubmitButton } from './ProfileSubmitButton.jsx';

const text = ar.profile;
const FIELD_NAMES = ['currentPassword', 'newPassword', 'confirmPassword'];

// Server keys that belong to a field: a wrong or missing current password, and the password
// rules on the new one.
const SERVER_KEY_FIELDS = {
  'Identity.CurrentPasswordRequired': 'currentPassword',
  'Identity.PasswordMismatch': 'currentPassword',
  'Identity.PasswordTooShort': 'newPassword',
  'Identity.PasswordRequiresDigit': 'newPassword',
  'Identity.PasswordRequiresLower': 'newPassword',
  'Identity.PasswordRequiresUpper': 'newPassword',
  'Identity.PasswordRequiresNonAlphanumeric': 'newPassword',
  'Identity.PasswordRequiresUniqueChars': 'newPassword',
};

const EMPTY_VALUES = { currentPassword: '', newPassword: '', confirmPassword: '' };

/**
 * Figma «الأمان» card (79:1652): title 18 bold, a muted line on how the user signs in, then
 * current | new (14 gap). With a password: «تغيير كلمة المرور» (current, new, confirm). A Google
 * account without one: «تعيين كلمة مرور» (new, confirm), and `hasPassword` becomes true after.
 * The confirm field, the rule chips and the button are not in Figma. The session stays valid.
 *
 * @param {{ hasPassword: boolean }} props
 */
export function PasswordForm({ hasPassword }) {
  const toast = useToast();
  const [changePassword] = useChangeMyPasswordMutation();
  const [failure, setFailure] = useState(null);

  let schema = setPasswordSchema;
  if (hasPassword) schema = changePasswordSchema;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues: EMPTY_VALUES });
  const newPassword = useWatch({ control, name: 'newPassword' });

  async function onSubmit(values) {
    setFailure(null);
    const body = { newPassword: values.newPassword };
    if (hasPassword) body.currentPassword = values.currentPassword;
    try {
      await changePassword(body).unwrap();
      reset(EMPTY_VALUES);
      let message = text.passwordSet;
      if (hasPassword) message = text.passwordChanged;
      toast.show({ tone: 'success', message });
    } catch (error) {
      // 429 (5 tries in 15 minutes) becomes the rate-limit message above the button.
      const { problem, formMessage } = applyServerErrors(
        error,
        setError,
        FIELD_NAMES,
        SERVER_KEY_FIELDS,
      );
      let requestId = null;
      if (problem.status >= 500) requestId = problem.requestId;
      setFailure({ message: formMessage, requestId });
    }
  }

  let subtitle = text.securityGoogle;
  let submitLabel = text.setPassword;
  if (hasPassword) {
    subtitle = text.securityWithPassword;
    submitLabel = text.changePassword;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-[18px] rounded-lg border border-border bg-raised px-4 py-5 xl:px-[26px] xl:py-6"
    >
      <div className="flex flex-col gap-[3px] leading-[1.72]">
        <h2 className="text-[18px] font-bold text-text">{text.securityTitle}</h2>
        <p className="text-[13px] text-muted">{subtitle}</p>
      </div>

      <div className="grid gap-[18px] sm:grid-cols-2 sm:gap-x-[14px]">
        {hasPassword && (
          <ProfilePasswordInput
            label={text.currentPassword}
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
        )}
        <ProfilePasswordInput
          label={text.newPassword}
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <ProfilePasswordInput
          label={text.confirmPassword}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>
      <PasswordRules password={newPassword} />

      {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}
      <ProfileSubmitButton loading={isSubmitting}>{submitLabel}</ProfileSubmitButton>
    </form>
  );
}
