import { useEffect, useId, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { LogOut, UserRound } from 'lucide-react';
import { selectCurrentUser } from '../../features/auth/authSlice.js';
import { useLogout } from '../../features/auth/hooks/useLogout.js';
import { ar } from '../../locales/ar.js';

/**
 * Avatar button + dropdown for a signed-in user. Shows the email until the API offers a
 * current-user endpoint with the name and photo.
 */
export function AccountMenu() {
  const t = ar.auth.account;
  const user = useSelector(selectCurrentUser);
  const [logout, { isLoading }] = useLogout();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t.menu}
        className="flex size-[38px] items-center justify-center rounded-full bg-brand-subtle text-brand transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <UserRound size={18} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute end-0 top-full z-50 mt-2 w-64 rounded-md border border-border bg-raised p-2 shadow-menu"
        >
          <div className="px-3 py-2">
            <p className="text-caption text-muted">{t.signedInAs}</p>
            <p dir="ltr" className="truncate text-end text-body-sm text-text">
              {user?.email}
            </p>
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            onClick={logout}
            disabled={isLoading}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-body-sm text-danger transition-colors hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60"
          >
            <LogOut size={16} aria-hidden="true" className="rtl:rotate-180" />
            {t.logout}
          </button>
        </div>
      )}
    </div>
  );
}
