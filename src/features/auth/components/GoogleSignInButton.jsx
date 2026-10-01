import { useLocation } from 'react-router';
import { IconGoogle } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import { hasGoogleClientId, startGoogleSignIn } from '../googleSignIn.js';

/**
 * Figma "دخول Google" (70:1856): the Google button + the "أو بالبريد الإلكتروني" divider.
 * Button: bg/canvas, border/strong, radius md, 13px vertical padding, 10 gap, text 14.5/1.72
 * (14 on mobile), with Google's "G" in the 20px logo slot. A click goes to Google's sign-in
 * page; Google comes back to /auth/google (GoogleCallbackPage). Without a client ID nothing
 * is shown.
 *
 * @param {{ returnTo: string }} props where a signed-in user lands afterwards
 */
export function GoogleSignInButton({ returnTo }) {
  const location = useLocation();

  if (!hasGoogleClientId()) return null;

  function handleClick() {
    startGoogleSignIn({ returnTo, startPath: `${location.pathname}${location.search}` });
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2.5 rounded-md border border-border-strong bg-bg py-3 text-[14px] leading-[1.72] font-semibold text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand xl:text-[14.5px]"
      >
        <IconGoogle className="shrink-0" />
        {ar.auth.google}
      </button>

      <div className="flex items-center gap-3 xl:gap-3.5">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[12px] leading-[1.72] text-muted xl:hidden">
          {ar.auth.orEmailShort}
        </span>
        <span className="hidden text-[12.5px] leading-[1.72] text-muted xl:inline">
          {ar.auth.orEmail}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
