import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { AuthHeading } from '../components/AuthHeading.jsx';
import { useSendResetPasswordCodeMutation } from '../authApi.js';
import { emailSchema } from '../schemas.js';
import { ar } from '../../../locales/ar.js';

/** Step 1 of the reset: ask for a 6-digit code by email. */
export default function ForgotPasswordPage() {
  const t = ar.auth.forgot;
  const navigate = useNavigate();
  const [sendCode] = useSendResetPasswordCodeMutation();
  const [formMessage, setFormMessage] = useState(/** @type {string | null} */ (null));

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

  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(null);
    try {
      // Always 204, whether or not the account exists.
      await sendCode(values).unwrap();
      navigate(`/reset-password?${new URLSearchParams({ email: values.email })}`);
    } catch (error) {
      setFormMessage(applyServerErrors(error, setError, ['email']).formMessage);
    }
  });

  return (
    <>
      <AuthHeading title={t.title} subtitle={t.subtitle} />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={ar.auth.fields.email}
          type="email"
          dir="ltr"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        {formMessage && <FormAlert>{formMessage}</FormAlert>}
        <Button type="submit" fullWidth loading={isSubmitting}>
          {t.submit}
        </Button>
      </form>
      <p className="mt-6 text-center text-body-sm">
        <Link to="/login" className="font-semibold text-brand-text hover:underline">
          {ar.auth.backToLogin}
        </Link>
      </p>
    </>
  );
}
