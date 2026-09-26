import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { IconBackArrow } from '../../../components/icons/index.js';
import { Checkbox } from '../../../components/ui/Checkbox.jsx';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import sunsetPhoto from '../../../assets/photos/panel-sunset.svg';
import { AuthInput } from '../components/AuthInput.jsx';
import { AuthSplitLayout } from '../components/AuthSplitLayout.jsx';
import { AuthSubmitButton } from '../components/AuthSubmitButton.jsx';
import { GoogleSignInButton } from '../components/GoogleSignInButton.jsx';
import { PasswordField } from '../components/PasswordField.jsx';
import { useLoginMutation } from '../authApi.js';
import { loginSchema } from '../schemas.js';
import { ar } from '../../../locales/ar.js';

/** Figma "تسجيل الدخول — زائر" (69:1159) and "تسجيل الدخول — موبايل" (84:716). */
export default function LoginPage() {
  const text = ar.auth.login;
  const [login] = useLoginMutation();
  const [failure, setFailure] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '', remember: true },
  });

  async function onSubmit(values) {
    setFailure(null);
    try {
      // On success the session starts and <RequireGuest> sends the user on.
      await login(values).unwrap();
    } catch (error) {
      const { problem, formMessage } = applyServerErrors(error, setError, ['email', 'password']);
      let requestId = null;
      if (problem.status >= 500) requestId = problem.requestId;
      setFailure({ message: formMessage, requestId, status: problem.status, email: values.email });
    }
  }

  return (
    <AuthSplitLayout
      photo={sunsetPhoto}
      mobileTitle={text.mobileTitle}
      mobileSubtitle={text.subtitle}
    >
      <Link
        to="/"
        className="hidden w-fit items-center gap-1.5 rounded-sm text-[13px] leading-[1.75] font-semibold text-muted focus-visible:outline-2 focus-visible:outline-brand xl:flex"
      >
        <IconBackArrow />
        {text.backHome}
      </Link>
      <h1 className="hidden text-[30px] leading-[1.75] font-bold text-text xl:block">
        {text.title}
      </h1>
      <p className="hidden text-[14.5px] leading-[1.75] text-text-secondary xl:block">
        {text.subtitle}
      </p>

      <GoogleSignInButton />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4 xl:gap-[18px]"
      >
        <AuthInput
          label={ar.auth.fields.email}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          label={ar.auth.fields.password}
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Desktop options row (69:1250); the mobile frame shows only the forgot link. */}
        <div className="hidden items-center gap-2.5 xl:flex">
          <Checkbox label={text.rememberMe} {...register('remember')} />
          <div className="flex-1" />
          <Link
            to="/forgot-password"
            className="text-[13px] leading-[1.75] font-semibold text-brand-text"
          >
            {text.forgotPassword}
          </Link>
        </div>
        <Link
          to="/forgot-password"
          className="self-end text-[12.5px] leading-[1.72] font-semibold text-brand-text xl:hidden"
        >
          {text.forgotPassword}
        </Link>

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
                  {text.resendConfirmation}
                </Link>
              </>
            )}
          </FormAlert>
        )}

        <AuthSubmitButton loading={isSubmitting}>{text.submit}</AuthSubmitButton>
      </form>

      <p className="flex items-center justify-center gap-1.5 text-[13px] leading-[1.72] xl:pt-1.5 xl:text-[13.5px] xl:leading-[1.75]">
        <span className="text-text-secondary">{text.noAccount}</span>
        <Link to="/register" className="font-semibold text-brand-text">
          {text.register}
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
