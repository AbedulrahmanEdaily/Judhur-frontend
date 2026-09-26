import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useSearchParams } from 'react-router';
import { CircleCheck, MailX } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner.jsx';
import { buttonClasses } from '../../../components/ui/buttonStyles.js';
import { AuthHeading } from '../components/AuthHeading.jsx';
import { ResendConfirmation } from '../components/ResendConfirmation.jsx';
import { authApi } from '../authApi.js';
import { ar } from '../../../locales/ar.js';

/**
 * Target of the email link: `/confirm-email?userId=<guid>&token=<token>`.
 * URLSearchParams has already decoded the token — it is sent as read.
 */
export default function ConfirmEmailPage() {
  const t = ar.auth.confirmEmail;
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');
  const hasParams = Boolean(userId && token);

  const [status, setStatus] = useState(/** @type {'pending'|'success'|'failure'} */ ('pending'));
  const started = useRef(false);

  useEffect(() => {
    // Confirm exactly once, even when effects run twice in development.
    if (!hasParams || started.current) return;
    started.current = true;
    dispatch(authApi.endpoints.confirmEmail.initiate({ userId, token }))
      .unwrap()
      .then(() => setStatus('success'))
      .catch(() => setStatus('failure'));
  }, [dispatch, hasParams, userId, token]);

  if (hasParams && status === 'pending') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center text-brand">
        <Spinner size={32} label={t.loading} />
        <p className="text-body-md text-text-secondary">{t.loading}</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-success-soft p-[18px] text-success">
          <CircleCheck size={30} aria-hidden="true" />
        </div>
        <AuthHeading title={t.successTitle} subtitle={t.successBody} />
        <Link to="/login" className={buttonClasses({ fullWidth: true })}>
          {ar.auth.login.submit}
        </Link>
      </div>
    );
  }

  // Missing parameters, or the API answered 400 (invalid or expired link).
  return (
    <>
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-danger-soft p-[18px] text-danger">
          <MailX size={30} aria-hidden="true" />
        </div>
      </div>
      <AuthHeading title={t.failureTitle} subtitle={t.failureBody} />
      <ResendConfirmation />
      <p className="mt-6 text-center text-body-sm">
        <Link to="/login" className="font-semibold text-brand-text hover:underline">
          {ar.auth.backToLogin}
        </Link>
      </p>
    </>
  );
}
