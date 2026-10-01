import { useEffect, useId, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { Avatar } from '../ui/Avatar.jsx';
import { selectCurrentUser, selectIsAdmin } from '../../features/auth/authSlice.js';
import { useLogout } from '../../features/auth/hooks/useLogout.js';
import { useMyProfile } from '../../features/profile/useMyProfile.js';
import { ar } from '../../locales/ar.js';

/**
 * Figma navbar "الحساب" (34:44): a 38px brand/subtle circle — the profile photo, or the first
 * letter of the name (`GET /me`). The dropdown it opens (name and email, «حسابي», the account
 * pages, logout) is not in Figma — built from tokens, listed in DESIGN.md.
 */
export function AccountMenu() {
  const user = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  const { logout, isLoggingOut } = useLogout();
  const { profile } = useMyProfile();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();

  // Close on a click outside the menu or on Escape.
  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current.contains(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Until the profile loads, the email stands in for the name.
  let displayName = user?.email ?? '';
  if (profile) displayName = profile.fullName;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`${ar.auth.account.menu} — ${displayName}`}
        title={displayName}
        className="block rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Avatar
          name={displayName}
          imageUrl={profile?.profileImageUrl}
          sizeClassName="size-[38px] text-[15px]"
        />
      </button>

      {isOpen && (
        <div
          id={menuId}
          className="absolute end-0 top-full z-50 mt-2 w-64 rounded-md border border-border bg-raised p-2 shadow-menu"
        >
          <div className="px-3 py-2">
            <p className="text-caption text-muted">{ar.auth.account.signedInAs}</p>
            {profile && (
              <p className="truncate text-body-sm font-semibold text-text">{profile.fullName}</p>
            )}
            <p className="truncate text-body-sm text-text-secondary">{user?.email}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="block rounded-sm px-3 py-2 text-body-sm text-text hover:bg-inset focus-visible:outline-2 focus-visible:outline-brand"
          >
            {ar.auth.account.profile}
          </Link>
          {/* The account pages (not for admins, who have no listings). */}
          {!isAdmin && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block rounded-sm px-3 py-2 text-body-sm text-text hover:bg-inset focus-visible:outline-2 focus-visible:outline-brand"
              >
                {ar.accountNav.dashboard}
              </Link>
              <Link
                to="/my-properties"
                onClick={() => setIsOpen(false)}
                className="block rounded-sm px-3 py-2 text-body-sm text-text hover:bg-inset focus-visible:outline-2 focus-visible:outline-brand"
              >
                {ar.accountNav.myProperties}
              </Link>
              <Link
                to="/favorites"
                onClick={() => setIsOpen(false)}
                className="block rounded-sm px-3 py-2 text-body-sm text-text hover:bg-inset focus-visible:outline-2 focus-visible:outline-brand"
              >
                {ar.accountNav.favorites}
              </Link>
              <div className="my-1 h-px bg-border" />
            </>
          )}
          {isAdmin && (
            <>
              <Link
                to="/admin/properties"
                onClick={() => setIsOpen(false)}
                className="block rounded-sm px-3 py-2 text-body-sm text-text hover:bg-inset focus-visible:outline-2 focus-visible:outline-brand"
              >
                {ar.admin.nav.queue}
              </Link>
              <div className="my-1 h-px bg-border" />
            </>
          )}
          <button
            type="button"
            onClick={logout}
            disabled={isLoggingOut}
            className="w-full rounded-sm px-3 py-2 text-start text-body-sm text-danger hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60"
          >
            {ar.auth.account.logout}
          </button>
        </div>
      )}
    </div>
  );
}
