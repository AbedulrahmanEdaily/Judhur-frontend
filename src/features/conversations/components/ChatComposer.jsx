import { useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconSend17 } from '../../../components/icons/index.js';
import { formatNumber } from '../../../lib/format.js';
import { actionErrorMessage, toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { selectIsRateLimited } from '../../ui/uiSlice.js';
import { useSendMessageMutation } from '../conversationsApi.js';
import { MAX_MESSAGE_LENGTH, messageSchema } from '../schemas.js';

const text = ar.conversations;

// The counter shows up near the limit.
const SHOW_COUNTER_FROM = 1800;

// The other side was banned or deleted (the project guide 6.16).
const PARTICIPANT_UNAVAILABLE = 'Conversations.ParticipantUnavailable';

/**
 * Figma "إدخال" (76:1118) with "حقل المحادثة / Chat Input" (47:800): bg/surface strip, the input
 * on bg/canvas with border/strong, radius lg, and the brand send button (11×9, radius md) at the
 * end. The attachment clip is left out (no API). Enter sends, Shift+Enter starts a new line;
 * the box grows with the text. The sent message comes back from the server into the chat.
 * When the other side can no longer be messaged (409 Conversations.ParticipantUnavailable),
 * the box and the button are disabled with «لم يعد بإمكانك مراسلة هذا المستخدم» (the chat
 * page mounts a new composer per conversation). A deleted account (no `otherParty`) closes it
 * from the first render.
 *
 * @param {{ conversationId: string, isParticipantGone?: boolean }} props
 */
export function ChatComposer({ conversationId, isParticipantGone = false }) {
  const [sendMessage] = useSendMessageMutation();
  const [sendFailure, setFailure] = useState(null);
  const [wasRefused, setWasRefused] = useState(false);
  const isClosed = isParticipantGone || wasRefused;
  let failure = sendFailure;
  if (!failure && isParticipantGone) failure = text.participantUnavailable;
  const inputId = useId();
  const errorId = useId();

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    control,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  });
  const content = useWatch({ control, name: 'content' });
  const isRateLimited = useSelector(selectIsRateLimited);
  const canSend = content.trim() !== '' && !isSubmitting && !isClosed && !isRateLimited;

  async function onSubmit(values) {
    setFailure(null);
    try {
      await sendMessage({ conversationId, content: values.content }).unwrap();
      reset({ content: '' });
      setFocus('content');
    } catch (error) {
      const problem = toProblem(error);
      if (problem.code === PARTICIPANT_UNAVAILABLE) {
        setWasRefused(true);
        setFailure(text.participantUnavailable);
      } else if (problem.status === 429) {
        setFailure(text.tooMany);
      } else {
        setFailure(actionErrorMessage(error));
      }
    }
  }

  function handleKeyDown(event) {
    // Enter sends; Shift+Enter (and Enter while an IME is composing) stays a new line.
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (canSend) handleSubmit(onSubmit)();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-2 border-t border-border bg-surface px-4 pt-3 pb-4 xl:px-[22px] xl:pt-4 xl:pb-[18px]"
    >
      {failure && (
        <p id={errorId} role="alert" className="text-caption text-danger">
          {failure}
        </p>
      )}
      <div className="flex items-end gap-2.5 rounded-lg border border-border-strong bg-bg py-2.5 ps-3.5 pe-3 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
        <label htmlFor={inputId} className="sr-only">
          {text.inputLabel}
        </label>
        <textarea
          id={inputId}
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={text.placeholder}
          onKeyDown={handleKeyDown}
          readOnly={isSubmitting}
          disabled={isClosed}
          aria-describedby={failure ? errorId : undefined}
          className="field-sizing-content max-h-32 min-h-[25px] min-w-0 flex-1 resize-none self-center bg-transparent text-[14.5px] leading-[1.75] text-text outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60"
          {...register('content')}
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label={text.sendMessage}
          aria-busy={isSubmitting || undefined}
          className="shrink-0 rounded-md bg-brand px-[11px] py-[9px] text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
        >
          <IconSend17 />
        </button>
      </div>
      {content.length >= SHOW_COUNTER_FROM && (
        <p className="text-end text-[12px] leading-[1.72] text-muted" aria-live="polite">
          <span dir="ltr">{`${formatNumber(content.length)} / ${formatNumber(MAX_MESSAGE_LENGTH)}`}</span>
        </p>
      )}
    </form>
  );
}
