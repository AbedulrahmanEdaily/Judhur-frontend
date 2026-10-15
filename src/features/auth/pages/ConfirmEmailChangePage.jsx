import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { IconToastError } from '../../../components/icons/index.js';
import { Logo } from '../../../components/layout/Logo.jsx';
import { Spinner } from '../../../components/ui/Spinner.jsx';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { noticeShown } from '../../ui/uiSlice.js';
import { authApi } from '../authApi.js';
import { sessionEnded } from '../authSlice.js';
import { AuthCard } from '../components/AuthCard.jsx';

const text = ar.auth.confirmEmailChange;
const INVALID_TOKEN = 'Identity.InvalidConfirmationToken';

const primaryLinkClasses =
  'inline-flex w-full items-center justify-center rounded-md bg-brand py-[15px] text-[15.5px] leading-[1.75] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/**
 * Target of the change-email link: `/confirm-email-change?userId=&email=&token=` (public). Posts
 * once with `newEmail` = the `email` param (URLSearchParams has already decoded it). Not in
 * Figma: the «تأكيد البريد» card (70:1253) like /confirm-email. On 204 the session ends here
 * and login opens with «تم تغيير بريدك…»; an invalid or expired link (400
 * Identity.InvalidConfirmationToken, or missing params) offers «حسابي» to ask again; any other
 * error (409 Identity.DuplicateEmail, …) shows the server's message.
 */
export default function ConfirmEmailChangePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const newEmail = searchParams.get('email');
  const token = searchParams.get('token');
  const hasLinkParams = Boolean(userId && newEmail && token);

  const [failure, setFailure] = useState(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    // Confirm exactly once, even when React runs effects twice in development.
    if (!hasLinkParams || hasStarted.current) return;
    hasStarted.current = true;
    dispatch(authApi.endpoints.confirmEmailChange.initiate({ userId, newEmail, token }))
      .unwrap()
      .then(() => {
        navigate('/login', { replace: true });
        dispatch(sessionEnded('logout'));
        dispatch(noticeShown({ tone: 'success', message: text.changed }));
      })
      .catch((error) => setFailure(toProblem(error)));
  }, [dispatch, navigate, hasLinkParams, userId, newEmail, token]);

  if (hasLinkParams && !failure) {
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

  let title = text.invalidTitle;
  let body = text.invalidBody;
  if (failure && failure.code !== INVALID_TOKEN && failure.status !== 400) {
    title = text.failedTitle;
    body = failure.message;
  }

  return (
    <AuthCard>
      <Logo size={64} decorative />
      <div className="rounded-full bg-danger-soft p-4 text-danger">
        <IconToastError width={28} height={28} />
      </div>
      <h1 className="text-[25px] leading-[1.75] font-bold text-text">{title}</h1>
      <p className="text-[14.5px] leading-[1.75] text-text-secondary">{body}</p>
      <Link to="/profile" className={primaryLinkClasses}>
        {text.toProfile}
      </Link>
    </AuthCard>
  );
}
