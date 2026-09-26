import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { IconBackArrow, IconLock } from '../../../components/icons/index.js';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { AuthCard } from '../components/AuthCard.jsx';
import { AuthInput } from '../components/AuthInput.jsx';
import { AuthSubmitButton } from '../components/AuthSubmitButton.jsx';
import { useSendResetPasswordCodeMutation } from '../authApi.js';
import { emailSchema } from '../schemas.js';
import { ar } from '../../../locales/ar.js';

/** Figma "استعادة كلمة المرور — زائر" (70:1314). Step 1: ask for the reset code. */
export default function ForgotPasswordPage() {
  const text = ar.auth.forgot;
  const navigate = useNavigate();
  const [sendCode] = useSendResetPasswordCodeMutation();
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
      // Always 204, whether or not the account exists.
      await sendCode(values).unwrap();
      navigate(`/reset-password?${new URLSearchParams({ email: values.email })}`);
    } catch (error) {
      setFormMessage(applyServerErrors(error, setError, ['email']).formMessage);
    }
  }

  return (
    <AuthCard>
      <div className="rounded-full bg-brand-subtle p-4 text-brand-text">
        <IconLock />
      </div>
      <h1 className="text-[25px] leading-[1.75] font-bold text-text">{text.title}</h1>
      <p className="text-[14.5px] leading-[1.75] text-text-secondary">{text.subtitle}</p>

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
        {formMessage && <FormAlert>{formMessage}</FormAlert>}
        <AuthSubmitButton loading={isSubmitting}>{text.submit}</AuthSubmitButton>
      </form>

      <Link
        to="/login"
        className="flex items-center justify-center gap-1.5 rounded-sm text-[13px] leading-[1.75] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
      >
        <IconBackArrow />
        {text.backToLogin}
      </Link>
    </AuthCard>
  );
}
