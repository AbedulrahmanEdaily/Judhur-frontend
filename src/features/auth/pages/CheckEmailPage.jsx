import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { IconMail } from '../../../components/icons/index.js';
import { Logo } from '../../../components/layout/Logo.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { AuthCard } from '../components/AuthCard.jsx';
import { useResendConfirmationMutation } from '../authApi.js';
import { useCountdown } from '../hooks/useCountdown.js';
import { ar } from '../../../locales/ar.js';

// The endpoint allows 3 requests per 15 minutes; waiting a minute avoids hitting that.
const RESEND_WAIT_MS = 60_000;

/** The time (ms) when the next resend is allowed, counted from now. */
function nextResendTime() {
  return Date.now() + RESEND_WAIT_MS;
}

/** "00:47" */
function formatMinutesAndSeconds(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/** Opens the webmail of common providers; anything else falls back to the mail app. */
function mailAppLink(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain === 'gmail.com') return 'https://mail.google.com';
  if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') {
    return 'https://outlook.live.com/mail';
  }
  if (domain === 'yahoo.com') return 'https://mail.yahoo.com';
  return 'mailto:';
}

/** Figma "تأكيد البريد — زائر" (70:1253): shown after sign-up, and from a blocked login. */
export default function CheckEmailPage() {
  const text = ar.auth.checkEmail;
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const toast = useToast();
  const [resend, { isLoading: isResending }] = useResendConfirmationMutation();
  // After sign-up an email was just sent, so resend waits a minute. From the login link
  // (`?from=login`) nothing was sent yet, so it is available at once.
  const [resendAvailableAt, setResendAvailableAt] = useState(() => {
    if (searchParams.get('from') === 'login') return 0;
    return nextResendTime();
  });
  const secondsLeft = useCountdown(resendAvailableAt);

  async function handleResend() {
    try {
      // The API answers 204 whether or not the email exists, so the message is always neutral.
      await resend({ email }).unwrap();
      toast.show({ tone: 'success', message: text.resent });
      setResendAvailableAt(nextResendTime());
    } catch (error) {
      toast.show({ tone: 'error', message: toProblem(error).message });
    }
  }

  let body = text.bodyNoEmail;
  if (email) body = text.body(email);

  return (
    <AuthCard>
      <Logo size={64} decorative />
      <div className="rounded-full bg-brand-subtle p-4 text-brand-text">
        <IconMail />
      </div>
      <h1 className="text-[25px] leading-[1.75] font-bold text-text">{text.title}</h1>
      <p className="text-[14.5px] leading-[1.75] text-text-secondary">{body}</p>
      <p className="w-full rounded-md bg-inset px-4 py-3.5 text-start text-[12.5px] leading-[1.75] text-text-secondary">
        {text.spamNotice}
      </p>
      <a
        href={mailAppLink(email)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-full items-center justify-center rounded-md bg-brand py-[15px] text-[15.5px] leading-[1.75] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {text.openMailApp}
      </a>

      {/* Resending needs the email; without it only the countdown text would be misleading. */}
      {email && secondsLeft > 0 && (
        <p className="text-[13px] leading-[1.75] font-semibold text-muted">
          {text.resendIn(formatMinutesAndSeconds(secondsLeft))}
        </p>
      )}
      {email && secondsLeft === 0 && (
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="rounded-sm text-[13px] leading-[1.75] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60"
        >
          {text.resend}
        </button>
      )}
    </AuthCard>
  );
}
