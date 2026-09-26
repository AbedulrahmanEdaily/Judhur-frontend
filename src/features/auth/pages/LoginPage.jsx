import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { PasswordInput } from '../../../components/form/PasswordInput.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { AuthHeading } from '../components/AuthHeading.jsx';
import { GoogleSignInButton } from '../components/GoogleSignInButton.jsx';
import { useLoginMutation } from '../authApi.js';
import { loginSchema } from '../schemas.js';
import { ar } from '../../../locales/ar.js';

const linkClasses = 'font-semibold text-brand-text hover:underline';

export default function LoginPage() {
  const t = ar.auth.login;
  const [login] = useLoginMutation();
  const [failure, setFailure] = useState(
    /** @type {{ message: string | null, requestId: string | null, status: number | null, email: string } | null} */ (
      null
    ),
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      // On success the session starts and <RequireGuest> sends the user on.
      await login(values).unwrap();
    } catch (error) {
      const { problem, formMessage } = applyServerErrors(error, setError, ['email', 'password']);
      setFailure({
        message: formMessage,
        requestId: problem.status !== null && problem.status >= 500 ? problem.requestId : null,
        status: problem.status,
        email: values.email,
      });
    }
  });

  return (
    <>
      <AuthHeading title={t.title} subtitle={t.subtitle} />
      <GoogleSignInButton />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={ar.auth.fields.email}
          type="email"
          dir="ltr"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="flex flex-col gap-1.5">
          <PasswordInput
            label={ar.auth.fields.password}
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Link to="/forgot-password" className={`self-end text-body-sm ${linkClasses}`}>
            {t.forgotPassword}
          </Link>
        </div>

        {failure?.message && (
          <FormAlert requestId={failure.requestId}>
            {failure.message}
            {/* 403 = email not confirmed or account locked; the API can't tell which yet. */}
            {failure.status === 403 && (
              <>
                {' '}
                <Link
                  to={`/register/check-email?${new URLSearchParams({ email: failure.email })}`}
                  className="font-semibold underline"
                >
                  {t.resendConfirmation}
                </Link>
              </>
            )}
          </FormAlert>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          {t.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-text-secondary">
        {t.noAccount}{' '}
        <Link to="/register" className={linkClasses}>
          {t.register}
        </Link>
      </p>
    </>
  );
}
