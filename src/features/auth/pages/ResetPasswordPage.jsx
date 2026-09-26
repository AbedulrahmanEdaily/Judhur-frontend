import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router';
import clsx from 'clsx';
import { IconBackArrow, IconLock } from '../../../components/icons/index.js';
import { useToast } from '../../../components/ui/useToast.js';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { AuthCard } from '../components/AuthCard.jsx';
import { AuthInput } from '../components/AuthInput.jsx';
import { AuthSubmitButton } from '../components/AuthSubmitButton.jsx';
import { PasswordField } from '../components/PasswordField.jsx';
import { PasswordRules } from '../components/PasswordRules.jsx';
import { useChangePasswordMutation, useSendResetPasswordCodeMutation } from '../authApi.js';
import { useCountdown } from '../hooks/useCountdown.js';
import { resetPasswordSchema } from '../schemas.js';
import { ar } from '../../../locales/ar.js';

const CODE_LIFETIME_MS = 5 * 60_000;
const FIELD_NAMES = ['email', 'code', 'password'];

// Server error codes that belong to a form field.
const ERROR_CODE_FIELDS = {
  'identity.InvalidResetCode': 'code',
  'identity.PasswordTooShort': 'password',
  'identity.PasswordRequiresDigit': 'password',
  'identity.PasswordRequiresLower': 'password',
  'identity.PasswordRequiresUpper': 'password',
  'identity.PasswordRequiresNonAlphanumeric': 'password',
  'identity.PasswordRequiresUniqueChars': 'password',
};

/** The time (ms) when a code sent now stops working. */
function codeExpiryTime() {
  return Date.now() + CODE_LIFETIME_MS;
}

/** "4:32" */
function formatMinutesAndSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/**
 * Step 2 of the reset: `/reset-password?email=…` — code + new password.
 * Not in Figma: built with the "استعادة كلمة المرور" card (70:1314) and its field styles.
 */
export default function ResetPasswordPage() {
  const text = ar.auth.reset;
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [changePassword] = useChangePasswordMutation();
  const [sendCode, { isLoading: isSendingCode }] = useSendResetPasswordCodeMutation();
  // The code was sent right before this page opened, or by "أرسل رمز جديد".
  const [codeExpiresAt, setCodeExpiresAt] = useState(codeExpiryTime);
  const secondsLeft = useCountdown(codeExpiresAt);
  const [notice, setNotice] = useState(null);
  const [failure, setFailure] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    trigger,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: searchParams.get('email') ?? '', code: '', password: '' },
  });
  const password = useWatch({ control, name: 'password' });

  async function onSubmit(values) {
    setFailure(null);
    setNotice(null);
    try {
      await changePassword(values).unwrap();
      toast.show({ tone: 'success', message: text.success });
      navigate('/login', { replace: true });
    } catch (error) {
      const { problem, formMessage } = applyServerErrors(
        error,
        setError,
        FIELD_NAMES,
        ERROR_CODE_FIELDS,
      );
      let requestId = null;
      if (problem.status >= 500) requestId = problem.requestId;
      setFailure({ message: formMessage, requestId });
    }
  }

  async function handleSendNewCode() {
    setFailure(null);
    setNotice(null);
    const emailIsValid = await trigger('email');
    if (!emailIsValid) return;
    try {
      await sendCode({ email: getValues('email') }).unwrap();
      setCodeExpiresAt(codeExpiryTime());
      setNotice(text.codeSent);
    } catch (error) {
      const { problem, formMessage } = applyServerErrors(error, setError, ['email']);
      setFailure({ message: formMessage, requestId: problem.requestId });
    }
  }

  let expiryText = text.expired;
  if (secondsLeft > 0) expiryText = text.expiresIn(formatMinutesAndSeconds(secondsLeft));

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

        <div className="flex flex-col gap-1.5">
          <AuthInput
            label={ar.auth.fields.code}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            hint={text.codeHint}
            error={errors.code?.message}
            {...register('code')}
          />
          <div className="flex items-center justify-between gap-2">
            <p
              aria-live="polite"
              className={clsx('text-caption', secondsLeft > 0 ? 'text-muted' : 'text-warning')}
            >
              {expiryText}
            </p>
            <button
              type="button"
              onClick={handleSendNewCode}
              disabled={isSendingCode}
              className="rounded-sm text-[13px] leading-[1.75] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60"
            >
              {text.sendNewCode}
            </button>
          </div>
        </div>

        <PasswordField
          label={ar.auth.fields.newPassword}
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordRules password={password} />

        {notice && <FormAlert tone="info">{notice}</FormAlert>}
        {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}

        <AuthSubmitButton loading={isSubmitting}>{text.submit}</AuthSubmitButton>
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
