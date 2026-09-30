import { useEffect, useRef } from 'react';
import { IconClose18 } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';

/**
 * The mobile filters sheet — not in Figma (the mobile frame shows only the «فلاتر» button).
 * A full-screen native `<dialog>` holding the same panel as the desktop sidebar: focus stays
 * inside, and Escape closes it.
 *
 * @param {{ open: boolean, onClose: () => void, children: import('react').ReactNode }} props
 */
export function FiltersDrawer({ open, onClose, children }) {
  const dialogRef = useRef(/** @type {HTMLDialogElement | null} */ (null));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={ar.search.filters}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-surface p-4 text-text backdrop:bg-black/50 xl:hidden"
    >
      <div className="flex justify-end pb-3">
        <button
          type="button"
          onClick={onClose}
          aria-label={ar.search.closeFilters}
          className="rounded-full bg-raised p-2 text-muted focus-visible:outline-2 focus-visible:outline-brand"
        >
          <IconClose18 />
        </button>
      </div>
      {children}
    </dialog>
  );
}
