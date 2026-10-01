import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { Checkbox } from '../../../components/ui/Checkbox.jsx';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { AuthInput } from '../components/AuthInput.jsx';
import { AuthSplitLayout } from '../components/AuthSplitLayout.jsx';
import { AuthSubmitButton } from '../components/AuthSubmitButton.jsx';
import { GoogleProfileStep } from '../components/GoogleProfileStep.jsx';
import { GoogleSignInButton } from '../components/GoogleSignInButton.jsx';
import { PasswordField } from '../components/PasswordField.jsx';
import { PasswordRules } from '../components/PasswordRules.jsx';
import { useRegisterMutation } from '../authApi.js';
import { registerSchema } from '../schemas.js';
import { ar } from '../../../locales/ar.js';

const FIELD_NAMES = ['fullName', 'email', 'phoneNumber', 'city', 'password'];

// Server error keys that belong to a form field.
const SERVER_KEY_FIELDS = {
  userName: 'email', // userName is sent as the email
  'Identity.DuplicateEmail': 'email',
  'Identity.DuplicateUserName': 'email',
  'Identity.PasswordTooShort': 'password',
  'Identity.PasswordRequiresDigit': 'password',
  'Identity.PasswordRequiresLower': 'password',
  'Identity.PasswordRequiresUpper': 'password',
  'Identity.PasswordRequiresNonAlphanumeric': 'password',
  'Identity.PasswordRequiresUniqueChars': 'password',
};

/** Figma "إنشاء حساب — زائر" (69:1262). The mobile layout follows the mobile login frame. */
export default function RegisterPage() {
  const text = ar.auth.register;
  const fields = ar.auth.fields;
  const navigate = useNavigate();
  const [registerAccount] = useRegisterMutation();
  const [failure, setFailure] = useState(null);
  // A first-time Google user's idToken while they add phone and city (state only, never stored).
  const [googleIdToken, setGoogleIdToken] = useState(null);

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
      fullName: '',
      email: '',
      phoneNumber: '',
      city: '',
      password: '',
      acceptTerms: false,
    },
  });
  const password = useWatch({ control, name: 'password' });

  async function onSubmit(values) {
    setFailure(null);
    const body = {
      userName: values.email, // the design has no user-name field (BACKEND_REQUESTS #13)
      fullName: values.fullName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      city: values.city,
      bio: null, // accepted but not saved by the API yet
      profileImageUrl: null,
      password: values.password,
    };
    try {
      await registerAccount(body).unwrap();
      navigate(`/register/check-email?${new URLSearchParams({ email: values.email })}`, {
        replace: true,
      });
    } catch (error) {
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

  if (googleIdToken) {
    return (
      <AuthSplitLayout
        mobileTitle={ar.auth.googleStep.title}
        mobileSubtitle={ar.auth.googleStep.subtitle}
      >
        <GoogleProfileStep idToken={googleIdToken} onBack={() => setGoogleIdToken(null)} />
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout mobileTitle={text.title} mobileSubtitle={text.subtitle}>
      <h1 className="hidden text-[30px] leading-[1.75] font-bold text-text xl:block">
        {text.title}
      </h1>
      <p className="hidden text-[14.5px] leading-[1.75] text-text-secondary xl:block">
        {text.subtitle}
      </p>

      <GoogleSignInButton onNeedsProfile={setGoogleIdToken} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4 xl:gap-[18px]"
      >
        <AuthInput
          label={fields.fullName}
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <AuthInput
          label={fields.email}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="flex gap-3">
          <AuthInput
            className="flex-1"
            label={fields.phoneNumber}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            error={errors.phoneNumber?.message}
            {...register('phoneNumber')}
          />
          <AuthInput
            className="flex-1"
            label={fields.city}
            autoComplete="address-level2"
            error={errors.city?.message}
            {...register('city')}
          />
        </div>
        <PasswordField
          label={fields.password}
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordRules password={password} />

        <div className="flex flex-col gap-1">
          <Checkbox label={text.terms} {...register('acceptTerms')} />
          {errors.acceptTerms && (
            <p className="text-caption text-danger">{errors.acceptTerms.message}</p>
          )}
        </div>

        {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}

        <AuthSubmitButton loading={isSubmitting}>{text.submit}</AuthSubmitButton>
      </form>

      <p className="flex items-center justify-center gap-1.5 text-[13px] leading-[1.72] xl:pt-1.5 xl:text-[13.5px] xl:leading-[1.75]">
        <span className="text-text-secondary">{text.haveAccount}</span>
        <Link to="/login" className="font-semibold text-brand-text">
          {text.login}
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
