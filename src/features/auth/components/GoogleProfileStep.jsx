import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { ar } from '../../../locales/ar.js';
import { useGoogleSignInMutation } from '../authApi.js';
import { googleFailureMessage } from '../googleSignIn.js';
import { googleProfileSchema } from '../schemas.js';
import { AuthInput } from './AuthInput.jsx';
import { AuthSubmitButton } from './AuthSubmitButton.jsx';

const FIELD_NAMES = ['phoneNumber', 'city'];

/**
 * The first-time Google step (not in Figma): phone and city with the register rules, then the
 * same idToken is sent again with them. The idToken lives only in the page's state (it is valid
 * for about an hour) and is never stored. Styled like the register fields.
 *
 * @param {{ idToken: string, onBack: () => void }} props
 */
export function GoogleProfileStep({ idToken, onBack }) {
  const text = ar.auth.googleStep;
  const fields = ar.auth.fields;
  const [googleSignIn] = useGoogleSignInMutation();
  const [failure, setFailure] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(googleProfileSchema),
    mode: 'onTouched',
    defaultValues: { phoneNumber: '', city: '' },
  });

  async function onSubmit(values) {
    setFailure(null);
    try {
      // On success the session starts and <RequireGuest> sends the user on.
      await googleSignIn({ idToken, phoneNumber: values.phoneNumber, city: values.city }).unwrap();
    } catch (error) {
      const { problem, formMessage } = applyServerErrors(error, setError, FIELD_NAMES);
      let message = formMessage;
      if (problem.status === 401 || problem.status === 403) message = googleFailureMessage(problem);
      let requestId = null;
      if (problem.status >= 500) requestId = problem.requestId;
      setFailure({ message, requestId });
    }
  }

  return (
    <>
      <h1 className="hidden text-[30px] leading-[1.75] font-bold text-text xl:block">
        {text.title}
      </h1>
      <p className="hidden text-[14.5px] leading-[1.75] text-text-secondary xl:block">
        {text.subtitle}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4 xl:gap-[18px]"
      >
        <AuthInput
          label={fields.phoneNumber}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />
        <AuthInput
          label={fields.city}
          autoComplete="address-level2"
          error={errors.city?.message}
          {...register('city')}
        />

        {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}

        <AuthSubmitButton loading={isSubmitting}>{text.submit}</AuthSubmitButton>
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="self-center rounded-sm text-[13.5px] leading-[1.72] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60"
        >
          {text.back}
        </button>
      </form>
    </>
  );
}
