import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { Spinner } from '../../../components/ui/Spinner.jsx';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { safeRedirectPath } from '../../../routes/redirect.js';
import { selectIsAuthenticated } from '../authSlice.js';
import { useGoogleSignInMutation } from '../authApi.js';
import { AuthSplitLayout } from '../components/AuthSplitLayout.jsx';
import { GoogleProfileStep } from '../components/GoogleProfileStep.jsx';
import {
  GOOGLE_REGISTRATION_INCOMPLETE,
  googleFailureMessage,
  readGoogleCallback,
} from '../googleSignIn.js';

const text = ar.auth;

/**
 * `/auth/google` — Google sends the browser back here with the idToken (not in Figma). The
 * token goes to `POST /google`: a signed-in user goes on to where they started; a first-time
 * Google user adds phone and city (the token stays in this page's state only); anything else
 * shows the message and a way back.
 */
export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [callback] = useState(() => readGoogleCallback());
  const [googleSignIn] = useGoogleSignInMutation();
  const [needsProfile, setNeedsProfile] = useState(false);
  const [failure, setFailure] = useState(null);
  const hasSentRef = useRef(false);

  useEffect(() => {
    // Send the token once (development mode runs effects twice).
    if (!callback.idToken || hasSentRef.current) return;
    hasSentRef.current = true;

    async function signIn() {
      try {
        await googleSignIn({ idToken: callback.idToken }).unwrap();
      } catch (error) {
        const problem = toProblem(error);
        if (problem.errorCodes[GOOGLE_REGISTRATION_INCOMPLETE]) {
          setNeedsProfile(true);
          return;
        }
        let requestId = null;
        if (problem.status >= 500) requestId = problem.requestId;
        setFailure({ message: googleFailureMessage(problem), requestId });
      }
    }
    signIn();
  }, [callback, googleSignIn]);

  // Signed in (right away, or after the phone and city step): on to where the user started.
  if (isAuthenticated) return <Navigate to={safeRedirectPath(callback.returnTo)} replace />;

  if (needsProfile) {
    return (
      <AuthSplitLayout
        mobileTitle={text.googleStep.title}
        mobileSubtitle={text.googleStep.subtitle}
      >
        <GoogleProfileStep
          idToken={callback.idToken}
          onBack={() => navigate(safeRedirectPath(callback.startPath, '/login'), { replace: true })}
        />
      </AuthSplitLayout>
    );
  }

  let message = callback.error;
  let requestId = null;
  if (failure) {
    message = failure.message;
    requestId = failure.requestId;
  }

  return (
    <AuthSplitLayout mobileTitle={text.google} mobileSubtitle={text.googleSigningIn}>
      {!message && (
        <p className="flex items-center justify-center gap-2.5 py-6 text-[14.5px] leading-[1.75] text-text-secondary">
          <Spinner />
          {text.googleSigningIn}
        </p>
      )}
      {message && (
        <>
          <FormAlert requestId={requestId}>{message}</FormAlert>
          <Link
            to={safeRedirectPath(callback.startPath, '/login')}
            replace
            className="self-center rounded-sm text-[13.5px] leading-[1.72] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
          >
            {text.googleBack}
          </Link>
        </>
      )}
    </AuthSplitLayout>
  );
}
