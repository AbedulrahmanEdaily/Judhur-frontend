import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { IconBackArrow, IconToastError } from '../../../components/icons/index.js';
import { Logo } from '../../../components/layout/Logo.jsx';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { AuthCard } from './AuthCard.jsx';
import { AuthInput } from './AuthInput.jsx';
import { AuthSubmitButton } from './AuthSubmitButton.jsx';
import { useResendConfirmationMutation } from '../authApi.js';
import { emailSchema } from '../schemas.js';
import { ar } from '../../../locales/ar.js';

/**
 * Failure state of /confirm-email (not in Figma): the "تأكيد البريد" card with a form to ask
 * for a new confirmation link.
 */
export function ConfirmEmailFailed() {
  const text = ar.auth.confirmEmail;
  const [resend] = useResendConfirmationMutation();
  const [isSent, setIsSent] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(emailSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  async function onSubmit(values) {
    setFormMessage(null);
    try {
      await resend(values).unwrap();
      setIsSent(true);
    } catch (error) {
      setFormMessage(applyServerErrors(error, setError, ['email']).formMessage);
    }
  }

  return (
    <AuthCard>
      <Logo size={64} decorative />
      <div className="rounded-full bg-danger-soft p-4 text-danger">
        <IconToastError width={28} height={28} />
      </div>
      <h1 className="text-[25px] leading-[1.75] font-bold text-text">{text.failureTitle}</h1>
      <p className="text-[14.5px] leading-[1.75] text-text-secondary">{text.failureBody}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex w-full flex-col gap-[18px]"
      >
        <AuthInput
          label={ar.auth.fields.email}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        {isSent && <FormAlert tone="success">{ar.auth.checkEmail.resent}</FormAlert>}
        {formMessage && <FormAlert>{formMessage}</FormAlert>}
        <AuthSubmitButton loading={isSubmitting}>{text.resendSubmit}</AuthSubmitButton>
      </form>

      <Link
        to="/login"
        className="flex items-center justify-center gap-1.5 rounded-sm text-[13px] leading-[1.75] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
      >
        <IconBackArrow />
        {ar.auth.forgot.backToLogin}
      </Link>
    </AuthCard>
  );
}
