import { useEffect, useId, useRef } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { ar } from '../../locales/ar.js';

/**
 * Figma "نافذة / Modal". Built on the native `<dialog>` + `showModal()`: the rest of the page
 * becomes inert (focus stays inside), Escape closes it, and focus returns to the opener.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title: string,
 *   children: import('react').ReactNode,
 *   footer?: import('react').ReactNode,
 *   className?: string,
 * }} props
 */
export function Modal({ open, onClose, title, children, footer, className }) {
  const dialogRef = useRef(/** @type {HTMLDialogElement | null} */ (null));
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Escape: let React state drive closing.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (event.target === event.currentTarget) onClose();
      }}
      className={clsx(
        'm-auto w-[480px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-raised p-0 text-text shadow-modal backdrop:bg-black/50',
        className,
      )}
    >
      <div className="flex flex-col gap-[18px] px-[26px] pt-[26px] pb-6">
        <div className="flex items-center gap-3">
          <h2 id={titleId} className="flex-1 text-[19px] leading-[1.75] font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={ar.common.close}
            className="rounded-sm p-1 text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-brand"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
        {footer && <div className="flex gap-2.5">{footer}</div>}
      </div>
    </dialog>
  );
}
