import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { ar } from '../../../locales/ar.js';
import { ListingTextarea } from '../../properties/components/ListingTextarea.jsx';
import { useStartConversationMutation } from '../conversationsApi.js';
import { MAX_MESSAGE_LENGTH, messageSchema } from '../schemas.js';

const text = ar.conversations;
const FIELD_NAMES = ['content'];

/**
 * «تواصل مع البائع» (not in Figma — the Modal 45:741): the first message, prefilled with
 * «مرحبًا، هل العقار ما زال متاحًا؟». Sending opens the conversation (a new one, or the one the
 * user already has about this listing). Mounted only while open, so it starts fresh.
 *
 * @param {{ property: { id: string, title: string }, onClose: () => void }} props
 */
export function ContactSellerDialog({ property, onClose }) {
  const navigate = useNavigate();
  const [startConversation] = useStartConversationMutation();
  const [failure, setFailure] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(messageSchema),
    mode: 'onTouched',
    defaultValues: { content: text.defaultMessage },
  });
  const content = useWatch({ control, name: 'content' });

  async function onSubmit(values) {
    setFailure(null);
    try {
      const started = await startConversation({
        propertyId: property.id,
        message: values.content,
      }).unwrap();
      navigate(`/messages/${started.conversationId}`);
    } catch (error) {
      // 404 not public, 409 own listing, 429: the server message above the button.
      const { problem, formMessage } = applyServerErrors(error, setError, FIELD_NAMES, {
        Message: 'content',
      });
      let requestId = null;
      if (problem.status >= 500) requestId = problem.requestId;
      setFailure({ message: formMessage, requestId });
    }
  }

  function close() {
    if (!isSubmitting) onClose();
  }

  return (
    <Modal open onClose={close} title={text.dialogTitle}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <p className="text-[14px] leading-[1.78] text-text-secondary">
          {text.dialogIntro(property.title)}
        </p>
        <div className="flex flex-col gap-1">
          <ListingTextarea
            label={text.messageLabel}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={4}
            error={errors.content?.message}
            {...register('content')}
          />
          <p className="text-end text-[12px] leading-[1.78] text-muted" aria-live="polite">
            <span dir="ltr">{`${content.length} / ${MAX_MESSAGE_LENGTH}`}</span>
          </p>
        </div>

        {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}

        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>
            {ar.common.cancel}
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">
            {text.send}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
