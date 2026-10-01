import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import {
  hasGoogleClientId,
  loadGoogleIdentity,
  setGoogleCredentialListener,
} from '../../../lib/googleIdentity.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { selectTheme } from '../../ui/uiSlice.js';
import { useGoogleSignInMutation } from '../authApi.js';
import { GOOGLE_REGISTRATION_INCOMPLETE, googleFailureMessage } from '../googleSignIn.js';

// Google's button is at most 400px wide.
const MAX_BUTTON_WIDTH = 400;

/**
 * Figma "دخول Google" (70:1856): the Google button + the "أو بالبريد الإلكتروني" divider. The
 * button is Google's own (renderButton, Arabic, as wide as the form up to Google's 400px), in
 * the dark variant in dark mode. Google's credential (the idToken) goes to `POST /google`
 * as is — it is never decoded here. A first-time Google user is handed to `onNeedsProfile`.
 * Without a client ID nothing is shown.
 *
 * @param {{ onNeedsProfile: (idToken: string) => void }} props
 */
export function GoogleSignInButton({ onNeedsProfile }) {
  const containerRef = useRef(null);
  const theme = useSelector(selectTheme);
  const [googleSignIn, { isLoading }] = useGoogleSignInMutation();
  const [loadFailed, setLoadFailed] = useState(false);
  const [failure, setFailure] = useState(null);
  const isEnabled = hasGoogleClientId();

  useEffect(() => {
    if (!isEnabled) return undefined;
    let isCancelled = false;

    async function handleCredential(idToken) {
      setFailure(null);
      try {
        // On success the session starts and <RequireGuest> sends the user on.
        await googleSignIn({ idToken }).unwrap();
      } catch (error) {
        const problem = toProblem(error);
        if (problem.errorCodes[GOOGLE_REGISTRATION_INCOMPLETE]) {
          onNeedsProfile(idToken);
          return;
        }
        let requestId = null;
        if (problem.status >= 500) requestId = problem.requestId;
        setFailure({ message: googleFailureMessage(problem), requestId });
      }
    }

    loadGoogleIdentity()
      .then((google) => {
        if (isCancelled) return;
        setGoogleCredentialListener(google, handleCredential);
        const width = Math.min(MAX_BUTTON_WIDTH, Math.round(containerRef.current.clientWidth));
        let buttonTheme = 'outline';
        if (theme === 'dark') buttonTheme = 'filled_black';
        google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: buttonTheme,
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          locale: 'ar',
          width,
        });
      })
      .catch(() => {
        if (!isCancelled) setLoadFailed(true);
      });

    return () => {
      isCancelled = true;
      if (window.google?.accounts?.id) setGoogleCredentialListener(window.google, null);
    };
  }, [isEnabled, theme, googleSignIn, onNeedsProfile]);

  if (!isEnabled) return null;

  return (
    <div className="flex flex-col gap-4">
      {loadFailed && (
        <p className="text-center text-[13px] leading-[1.72] text-muted">
          {ar.auth.googleLoadFailed}
        </p>
      )}
      {!loadFailed && (
        // Google draws its 44px button in here, in an iframe. A light color-scheme keeps the
        // iframe transparent in dark mode (else the browser paints a white box behind it).
        <div
          ref={containerRef}
          aria-busy={isLoading}
          className="flex min-h-11 w-full justify-center [color-scheme:light]"
        />
      )}
      {isLoading && (
        <p role="status" className="text-center text-[13px] leading-[1.72] text-muted">
          {ar.auth.googleSigningIn}
        </p>
      )}
      {failure && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}

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
