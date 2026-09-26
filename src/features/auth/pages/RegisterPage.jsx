import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { PasswordInput } from '../../../components/form/PasswordInput.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { AuthHeading } from '../components/AuthHeading.jsx';
import { GoogleSignInButton } from '../components/GoogleSignInButton.jsx';
import { PasswordChecklist } from '../components/PasswordChecklist.jsx';
import { useRegisterMutation } from '../authApi.js';
import { registerSchema } from '../schemas.js';
import { ar } from '../../../locales/ar.js';

const FIELDS = ['userName', 'fullName', 'email', 'phoneNumber', 'city', 'password'];

/** Identity password errors arrive as codes (`Identity.PasswordTooShort`, …). */
const fieldForKey = (key) => (key.startsWith('identity.Password') ? 'password' : undefined);

export default function RegisterPage() {
  const t = ar.auth.register;
  const f = ar.auth.fields;
  const navigate = useNavigate();
  const [registerAccount] = useRegisterMutation();
  const [failure, setFailure] = useState(
    /** @type {{ message: string | null, requestId: string | null } | null} */ (null),
  );

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      userName: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      city: '',
      password: '',
    },
  });

  const password = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      // bio and profileImageUrl are accepted but not saved by the API yet — always null for now.
      await registerAccount({ ...values, bio: null, profileImageUrl: null }).unwrap();
      navigate(`/register/check-email?${new URLSearchParams({ email: values.email })}`, {
        replace: true,
      });
    } catch (error) {
      const { problem, formMessage } = applyServerErrors(error, setError, FIELDS, fieldForKey);
      setFailure({
        message: formMessage,
        requestId: problem.status !== null && problem.status >= 500 ? problem.requestId : null,
      });
    }
  });

  return (
    <>
      <AuthHeading title={t.title} subtitle={t.subtitle} />
      <GoogleSignInButton />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={f.fullName}
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label={f.userName}
          dir="ltr"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          error={errors.userName?.message}
          {...register('userName')}
        />
        <Input
          label={f.email}
          type="email"
          dir="ltr"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={f.phoneNumber}
          type="tel"
          dir="ltr"
          inputMode="tel"
          autoComplete="tel"
          hint={ar.auth.hints.phoneNumber}
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />
        <Input
          label={f.city}
          autoComplete="address-level2"
          error={errors.city?.message}
          {...register('city')}
        />
        <div className="flex flex-col gap-2">
          <PasswordInput
            label={f.password}
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordChecklist value={password} />
        </div>

        {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}

        <Button type="submit" fullWidth loading={isSubmitting}>
          {t.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-text-secondary">
        {t.haveAccount}{' '}
        <Link to="/login" className="font-semibold text-brand-text hover:underline">
          {t.login}
        </Link>
      </p>
    </>
  );
}
