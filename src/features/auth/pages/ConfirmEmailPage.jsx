import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useSearchParams } from 'react-router';
import { IconToastCheck } from '../../../components/icons/index.js';
import { Logo } from '../../../components/layout/Logo.jsx';
import { Spinner } from '../../../components/ui/Spinner.jsx';
import { AuthCard } from '../components/AuthCard.jsx';
import { ConfirmEmailFailed } from '../components/ConfirmEmailFailed.jsx';
import { authApi } from '../authApi.js';
import { ar } from '../../../locales/ar.js';

/**
 * Target of the email link: `/confirm-email?userId=<guid>&token=<token>`.
 * Not in Figma: built with the "تأكيد البريد" card (70:1253). URLSearchParams has already
 * decoded the token, so it is sent as read.
 */
export default function ConfirmEmailPage() {
  const text = ar.auth.confirmEmail;
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');
  const hasLinkParams = Boolean(userId && token);

  const [status, setStatus] = useState('pending'); // 'pending' | 'success' | 'failure'
  const hasStarted = useRef(false);

  useEffect(() => {
    // Confirm exactly once, even when React runs effects twice in development.
    if (!hasLinkParams || hasStarted.current) return;
    hasStarted.current = true;
    dispatch(authApi.endpoints.confirmEmail.initiate({ userId, token }))
      .unwrap()
      .then(() => setStatus('success'))
      .catch(() => setStatus('failure'));
  }, [dispatch, hasLinkParams, userId, token]);

  if (hasLinkParams && status === 'pending') {
    return (
      <AuthCard>
        <Logo size={64} decorative />
        <span className="text-brand">
          <Spinner size={32} label={text.loading} />
        </span>
        <p className="text-[14.5px] leading-[1.75] text-text-secondary">{text.loading}</p>
      </AuthCard>
    );
  }

  if (status === 'success') {
    return (
      <AuthCard>
        <Logo size={64} decorative />
        <div className="rounded-full bg-success-soft p-4 text-success">
          <IconToastCheck width={28} height={28} />
        </div>
        <h1 className="text-[25px] leading-[1.75] font-bold text-text">{text.successTitle}</h1>
        <p className="text-[14.5px] leading-[1.75] text-text-secondary">{text.successBody}</p>
        <Link
          to="/login"
          className="inline-flex w-full items-center justify-center rounded-md bg-brand py-[15px] text-[15.5px] leading-[1.75] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {ar.auth.login.submit}
        </Link>
      </AuthCard>
    );
  }

  // Missing link parameters, or the API answered 400 (invalid or expired link).
  return <ConfirmEmailFailed />;
}
