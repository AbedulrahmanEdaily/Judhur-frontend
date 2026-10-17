import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { ar } from '../../../locales/ar.js';
import {
  GOOGLE_REAUTH_FAILED,
  GOOGLE_REAUTH_REQUIRED,
  REAUTH_ACTIONS,
  clearGoogleReauth,
  peekGoogleReauth,
} from '../../auth/googleSignIn.js';
import { deleteAccountSchema } from '../../auth/schemas.js';
import { ListingInput } from '../../properties/components/ListingInput.jsx';
import { noticeShown } from '../../ui/uiSlice.js';
import { useDeleteMyAccountMutation } from '../profileApi.js';
import { GoogleReauthPrompt } from './GoogleReauthPrompt.jsx';
import { ProfilePasswordInput } from './ProfilePasswordInput.jsx';

const text = ar.profile.deleteAccount;
const FIELD_NAMES = ['password', 'confirmText'];
const SERVER_KEY_FIELDS = {
  'Identity.CurrentPasswordRequired': 'password',
  'Identity.InvalidPassword': 'password',
};

/**
 * «حذف حسابك نهائياً؟» (not in Figma — the Modal 45:741 in the danger tone): what a deletion
 * does, then the password (or, for a Google-only account, a Google confirmation and typing
 * «حذف حسابي»). On 204 home opens
 * and the session ends there, as on logout (the session listener resets the whole API cache).
 * 409 Users.AdminCannotDeleteAccount and 429 show above the buttons.
 *
 * @param {{ hasPassword: boolean, onClose: () => void }} props
 */
export function DeleteAccountDialog({ hasPassword, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleteAccount] = useDeleteMyAccountMutation();
  const [failure, setFailure] = useState(null);
  const [googleIdToken, setGoogleIdToken] = useState(() => {
    if (hasPassword) return null;
    return peekGoogleReauth(REAUTH_ACTIONS.deleteAccount);
  });
  const needsReauth = !hasPassword && !googleIdToken;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(deleteAccountSchema(hasPassword)),
    mode: 'onTouched',
    defaultValues: { password: '', confirmText: '' },
  });

  async function onSubmit(values) {
    setFailure(null);
    let body = { googleIdToken };
    if (hasPassword) body = { password: values.password };
    try {
      await deleteAccount(body).unwrap();
      clearGoogleReauth();
      // Like a logout: home first, and AppLayout ends the session once home is on screen
      // (ending it here would send this signed-in-only page to login).
      navigate('/', { replace: true, state: { endSession: true } });
      dispatch(noticeShown({ tone: 'success', message: text.deleted }));
    } catch (error) {
      const { problem, formMessage } = applyServerErrors(
        error,
        setError,
        FIELD_NAMES,
        SERVER_KEY_FIELDS,
      );
      if (problem.errorCodes[GOOGLE_REAUTH_REQUIRED] || problem.errorCodes[GOOGLE_REAUTH_FAILED]) {
        clearGoogleReauth();
        setGoogleIdToken(null);
      }
      let requestId = null;
      if (problem.status >= 500) requestId = problem.requestId;
      setFailure({ message: formMessage, requestId });
    }
  }

  function close() {
    if (isSubmitting) return;
    clearGoogleReauth();
    onClose();
  }

  return (
    <Modal open onClose={close} title={text.dialogTitle}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-[18px]">
        <div className="flex flex-col gap-2 rounded-md bg-danger-soft px-3.5 py-3 text-danger">
          <p className="text-[13px] leading-[1.78] font-semibold">{text.effectsTitle}</p>
          <ul className="flex list-disc flex-col gap-1 ps-5 text-[13px] leading-[1.78]">
            {text.effects.map((effect) => (
              <li key={effect}>{effect}</li>
            ))}
          </ul>
        </div>
        {hasPassword && (
          <ProfilePasswordInput
            label={text.password}
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        )}
        {needsReauth && <GoogleReauthPrompt action={REAUTH_ACTIONS.deleteAccount} />}
        {!hasPassword && !needsReauth && (
          <ListingInput
            label={text.typePhrase(text.confirmPhrase)}
            autoComplete="off"
            error={errors.confirmText?.message}
            {...register('confirmText')}
          />
        )}
        {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}
        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>
            {ar.common.cancel}
          </Button>
          <Button
            type="submit"
            variant="danger"
            loading={isSubmitting}
            disabled={needsReauth}
            className="flex-1"
          >
            {text.confirm}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
