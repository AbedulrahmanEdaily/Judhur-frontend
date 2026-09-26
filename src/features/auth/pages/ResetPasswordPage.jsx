import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router';
import clsx from 'clsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { PasswordInput } from '../../../components/form/PasswordInput.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { AuthHeading } from '../components/AuthHeading.jsx';
import { PasswordChecklist } from '../components/PasswordChecklist.jsx';
import { useChangePasswordMutation, useSendResetPasswordCodeMutation } from '../authApi.js';
import { formatSeconds, useCountdown } from '../hooks/useCountdown.js';
import { resetPasswordSchema } from '../schemas.js';
import { ar } from '../../../locales/ar.js';

const CODE_LIFETIME_MS = 5 * 60_000;
const FIELDS = ['email', 'code', 'password'];

/** `Identity.InvalidResetCode` belongs to the code field; Identity password errors to password. */
function fieldForKey(key) {
  if (key === 'identity.InvalidResetCode') return 'code';
  if (key.startsWith('identity.Password')) return 'password';
  return undefined;
}

/** Step 2 of the reset: `/reset-password?email=…` — code + new password. */
export default function ResetPasswordPage() {
  const t = ar.auth.reset;
  const f = ar.auth.fields;
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [changePassword] = useChangePasswordMutation();
  const [sendCode, { isLoading: isSendingCode }] = useSendResetPasswordCodeMutation();

  // The code was sent right before this page opened (or by "send a new code").
  const [codeSentAt, setCodeSentAt] = useState(() => Date.now());
  const secondsLeft = useCountdown(codeSentAt + CODE_LIFETIME_MS, CODE_LIFETIME_MS / 1000);
  const [notice, setNotice] = useState(/** @type {string | null} */ (null));
  const [failure, setFailure] = useState(
    /** @type {{ message: string | null, requestId: string | null } | null} */ (null),
  );

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

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    setNotice(null);
    try {
      await changePassword(values).unwrap();
      toast.show({ tone: 'success', message: t.success });
      navigate('/login', { replace: true });
    } catch (error) {
      const { problem, formMessage } = applyServerErrors(error, setError, FIELDS, fieldForKey);
      setFailure({
        message: formMessage,
        requestId: problem.status !== null && problem.status >= 500 ? problem.requestId : null,
      });
    }
  });

  const onSendNewCode = async () => {
    setFailure(null);
    setNotice(null);
    if (!(await trigger('email'))) return;
    try {
      await sendCode({ email: getValues('email') }).unwrap();
      setCodeSentAt(Date.now());
      setNotice(t.codeSent);
    } catch (error) {
      const { problem, formMessage } = applyServerErrors(error, setError, ['email']);
      setFailure({ message: formMessage, requestId: problem.requestId });
    }
  };

  return (
    <>
      <AuthHeading title={t.title} subtitle={t.subtitle} />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={f.email}
          type="email"
          dir="ltr"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="flex flex-col gap-2">
          <Input
            label={f.code}
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            hint={ar.auth.hints.code}
            error={errors.code?.message}
            className="[&_input]:tracking-[0.5em]"
            {...register('code')}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              aria-live="polite"
              className={clsx('text-caption', secondsLeft > 0 ? 'text-muted' : 'text-warning')}
            >
              {secondsLeft > 0 ? t.expiresIn(formatSeconds(secondsLeft)) : t.expired}
            </p>
            <Button variant="ghost" size="sm" onClick={onSendNewCode} loading={isSendingCode}>
              {t.sendNewCode}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <PasswordInput
            label={f.newPassword}
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordChecklist value={password} />
        </div>

        {notice && <FormAlert tone="info">{notice}</FormAlert>}
        {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}

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
