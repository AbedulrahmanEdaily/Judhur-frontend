import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconTrash } from '../icons/index.js';
import { Spinner } from './Spinner.jsx';
import { ar } from '../../locales/ar.js';

// Figma variants: حذف عقار / حذف حساب / رفض عقار use danger; تعطيل عقار uses warning.
const iconCircleClasses = {
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
};
const confirmColorClasses = {
  danger: 'bg-danger',
  warning: 'bg-warning',
};

/**
 * Figma "حوار تأكيد / Confirm Dialog" (48:802) — every destructive action goes through this.
 * 460 wide, bg/raised, border/subtle, radius xl, 28/28/24 padding, 16 gap, shadow-dialog.
 * The confirm button names the action ("احذف العقار", never "تأكيد") and sits at the end of the
 * row (left in RTL); cancel sits at the start and gets the first focus.
 * Optional parts: `details` (48:749), `confirmWord` type-to-confirm (48:794), `reason` (48:778).
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onConfirm: (reason?: string) => void,
 *   title: string,
 *   description: string,
 *   confirmLabel: string,
 *   cancelLabel?: string,
 *   tone?: 'danger'|'warning',
 *   details?: import('react').ReactNode,
 *   confirmWord?: string,
 *   reason?: { label: string, placeholder?: string },
 *   loading?: boolean,
 *   icon?: import('react').ComponentType<import('react').SVGProps<SVGSVGElement>>,
 * }} props
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = ar.common.cancel,
  tone = 'danger',
  details,
  confirmWord,
  reason,
  loading = false,
  icon: Icon = IconTrash,
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const typedId = useId();
  const reasonId = useId();
  const [typedWord, setTypedWord] = useState('');
  const [reasonText, setReasonText] = useState('');

  // Clear what was typed each time the dialog opens (React's "adjust state on prop change").
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTypedWord('');
      setReasonText('');
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function close() {
    if (!loading) onClose();
  }

  let canConfirm = !loading;
  if (confirmWord && typedWord.trim() !== confirmWord) canConfirm = false;
  if (reason && reasonText.trim() === '') canConfirm = false;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canConfirm) return;
    if (reason) onConfirm(reasonText.trim());
    else onConfirm();
  }

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        // Escape: let the parent's `open` state decide.
        event.preventDefault();
        close();
      }}
      className="m-auto w-[460px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-raised p-0 text-text shadow-dialog backdrop:bg-black/50"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-[27px] pt-[27px] pb-[23px]">
        <div className="flex items-center gap-3">
          <div className={clsx('shrink-0 rounded-full p-2.5', iconCircleClasses[tone])}>
            <Icon />
          </div>
          <h2 id={titleId} className="text-[19px] leading-[1.78] font-bold">
            {title}
          </h2>
        </div>

        <p id={descriptionId} className="text-[14px] leading-[1.78] text-text-secondary">
          {description}
        </p>

        {details && (
          <div className="rounded-md bg-danger-soft px-3.5 py-3 text-[12.5px] leading-[1.78] font-semibold whitespace-pre-wrap text-danger">
            {details}
          </div>
        )}

        {reason && (
          <div className="flex flex-col gap-4">
            <label htmlFor={reasonId} className="text-[13px] leading-[1.78] font-semibold">
              {reason.label}
            </label>
            <textarea
              id={reasonId}
              value={reasonText}
              onChange={(event) => setReasonText(event.target.value)}
              placeholder={reason.placeholder}
              rows={1}
              className="resize-y rounded-md border border-border-strong bg-bg px-[13px] pt-[11px] pb-[29px] text-[13.5px] leading-[1.78] outline-none placeholder:text-muted focus:border-brand focus:ring-1 focus:ring-brand focus:ring-inset"
            />
          </div>
        )}

        {confirmWord && (
          <div className="flex flex-col gap-4">
            <label
              htmlFor={typedId}
              className="text-[13px] leading-[1.78] font-semibold whitespace-pre-wrap"
            >
              {ar.confirm.typeToConfirm(confirmWord)}
            </label>
            <input
              id={typedId}
              value={typedWord}
              onChange={(event) => setTypedWord(event.target.value)}
              autoComplete="off"
              className="rounded-md border-[1.5px] border-danger bg-bg px-[12.5px] py-[10.5px] text-[14.5px] leading-[1.78] outline-none focus:ring-1 focus:ring-danger"
            />
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <button
            ref={cancelRef}
            type="button"
            onClick={close}
            disabled={loading}
            className="rounded-md border border-border-strong bg-surface px-[23px] py-[11px] text-[14.5px] leading-[1.78] font-semibold whitespace-nowrap text-text transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={!canConfirm}
            aria-busy={loading || undefined}
            className={clsx(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-md px-5 py-3 text-[14.5px] leading-[1.78] font-semibold whitespace-nowrap text-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60',
              confirmColorClasses[tone],
            )}
          >
            {loading && <Spinner size={16} />}
            {confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
