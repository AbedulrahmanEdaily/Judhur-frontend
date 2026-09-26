import { useEffect, useId, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './Button.jsx';
import { ar } from '../../locales/ar.js';

/**
 * @typedef {{
 *   open: boolean,
 *   onClose: () => void,
 *   onConfirm: () => void,
 *   title: string,
 *   description: string,
 *   confirmLabel: string,
 *   cancelLabel?: string,
 *   details?: import('react').ReactNode,
 *   confirmWord?: string,
 *   loading?: boolean,
 *   icon?: import('react').ComponentType<{ size?: number, 'aria-hidden'?: boolean | 'true' }>,
 * }} ConfirmDialogProps
 */

/**
 * Figma "حوار تأكيد / Confirm Dialog" — every destructive action goes through this.
 * The confirm button names the action ("احذف العقار", never "تأكيد") and sits at the end of
 * the row (left in RTL); cancel sits at the start and gets the initial focus.
 * Pass `confirmWord` to require typing a word before the action is enabled.
 *
 * @param {ConfirmDialogProps} props
 */
export function ConfirmDialog({ open, onClose, loading = false, ...bodyProps }) {
  const dialogRef = useRef(/** @type {HTMLDialogElement | null} */ (null));
  const cancelRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => {
    if (!loading) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className="m-auto w-[460px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-raised p-0 text-text shadow-dialog backdrop:bg-black/50"
    >
      {/* Mounted only while open, so the typed confirmation resets on every opening. */}
      {open && (
        <ConfirmDialogBody
          {...bodyProps}
          loading={loading}
          onCancel={close}
          cancelRef={cancelRef}
          titleId={titleId}
          descriptionId={descriptionId}
        />
      )}
    </dialog>
  );
}

function ConfirmDialogBody({
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel,
  cancelLabel = ar.common.cancel,
  details,
  confirmWord,
  loading,
  icon: Icon = Trash2,
  cancelRef,
  titleId,
  descriptionId,
}) {
  const typedId = useId();
  const [typed, setTyped] = useState('');
  const canConfirm = !confirmWord || typed.trim() === confirmWord;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canConfirm && !loading) onConfirm();
      }}
      className="flex flex-col gap-4 px-7 pt-7 pb-6"
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-full bg-danger-soft p-2.5 text-danger">
          <Icon size={20} aria-hidden="true" />
        </div>
        <h2 id={titleId} className="text-[19px] leading-[1.78] font-bold">
          {title}
        </h2>
      </div>

      <p id={descriptionId} className="text-[14px] leading-[1.78] text-text-secondary">
        {description}
      </p>

      {details && (
        <div className="rounded-md bg-danger-soft px-3.5 py-3 text-[12.5px] leading-[1.78] font-semibold text-danger">
          {details}
        </div>
      )}

      {confirmWord && (
        <div className="flex flex-col gap-2">
          <label htmlFor={typedId} className="text-[13px] font-semibold">
            {ar.confirm.typeToConfirm(confirmWord)}
          </label>
          <input
            id={typedId}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            className="rounded-md border-[1.5px] border-danger bg-bg px-3.5 py-3 text-[14.5px] outline-none focus-visible:ring-1 focus-visible:ring-danger"
          />
        </div>
      )}

      <div className="flex gap-2.5 pt-1">
        <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          variant="danger"
          className="flex-1"
          disabled={!canConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </form>
  );
}
