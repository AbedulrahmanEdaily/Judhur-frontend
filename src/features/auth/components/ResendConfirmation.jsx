import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { useResendConfirmationMutation } from '../authApi.js';
import { useCooldown } from '../hooks/useCountdown.js';
import { emailSchema } from '../schemas.js';
import { ar } from '../../../locales/ar.js';

// The endpoint allows 3 requests per 15 minutes; a short pause avoids hitting that by accident.
const RESEND_COOLDOWN_MS = 60_000;

/**
 * "Resend confirmation email". The API answers 204 whether or not the email exists, so the
 * same neutral message is shown every time.
 *
 * @param {{ defaultEmail?: string }} props
 */
export function ResendConfirmation({ defaultEmail = '' }) {
  const [resend] = useResendConfirmationMutation();
  const [sent, setSent] = useState(false);
  const [formMessage, setFormMessage] = useState(/** @type {string | null} */ (null));
  const [secondsLeft, startCooldown] = useCooldown();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(emailSchema),
    mode: 'onTouched',
    defaultValues: { email: defaultEmail },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormMessage(null);
    try {
      await resend(values).unwrap();
      setSent(true);
      startCooldown(RESEND_COOLDOWN_MS);
    } catch (error) {
      setSent(false);
      setFormMessage(applyServerErrors(error, setError, ['email']).formMessage);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {/* Keep the field when the email came from the URL too, so it can be corrected. */}
      <Input
        label={ar.auth.fields.email}
        type="email"
        dir="ltr"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      {sent && <FormAlert tone="success">{ar.auth.resend.sent}</FormAlert>}
      {formMessage && <FormAlert>{formMessage}</FormAlert>}
      <Button
        type="submit"
        variant="secondary"
        fullWidth
        loading={isSubmitting}
        disabled={secondsLeft > 0}
      >
        {secondsLeft > 0 ? ar.auth.resend.waitSeconds(secondsLeft) : ar.auth.resend.submit}
      </Button>
    </form>
  );
}
