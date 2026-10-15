import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { ar } from '../../../locales/ar.js';
import { changeEmailSchema } from '../../auth/schemas.js';
import { ListingInput } from '../../properties/components/ListingInput.jsx';
import { useChangeMyEmailMutation } from '../profileApi.js';
import { ProfilePasswordInput } from './ProfilePasswordInput.jsx';

const text = ar.profile.changeEmail;
const FIELD_NAMES = ['newEmail', 'password'];
// The codes that belong under a field (the project guide 6.12).
const SERVER_KEY_FIELDS = {
  'Identity.EmailUnchanged': 'newEmail',
  'Identity.DuplicateEmail': 'newEmail',
  'Identity.CurrentPasswordRequired': 'password',
  'Identity.InvalidPassword': 'password',
};

/**
 * «تغيير البريد الإلكتروني» (not in Figma — the Modal 45:741 with the profile's fields): the new
 * email and, for an account with a password, the current password. On 204 a link goes to the new
 * email and nothing changes until it is opened. Mounted only while open, so it starts empty.
 *
 * @param {{ currentEmail: string, hasPassword: boolean, onClose: () => void }} props
 */
export function ChangeEmailDialog({ currentEmail, hasPassword, onClose }) {
  const toast = useToast();
  const [changeEmail] = useChangeMyEmailMutation();
  const [failure, setFailure] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changeEmailSchema(hasPassword)),
    mode: 'onTouched',
    defaultValues: { newEmail: '', password: '' },
  });

  async function onSubmit(values) {
    setFailure(null);
    const body = { newEmail: values.newEmail };
    if (hasPassword) body.password = values.password;
    try {
      await changeEmail(body).unwrap();
      toast.show({ tone: 'success', message: text.sent });
      onClose();
    } catch (error) {
      // 429 and anything without a field go above the buttons.
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

  function close() {
    if (!isSubmitting) onClose();
  }

  return (
    <Modal open onClose={close} title={text.title}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-[18px]">
        <p className="text-[14px] leading-[1.78] text-text-secondary">{text.intro(currentEmail)}</p>
        <ListingInput
          label={text.newEmail}
          type="email"
          dir="ltr"
          autoComplete="email"
          error={errors.newEmail?.message}
          {...register('newEmail')}
        />
        {hasPassword && (
          <ProfilePasswordInput
            label={text.password}
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        )}
        {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}
        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>
            {ar.common.cancel}
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">
            {text.submit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
