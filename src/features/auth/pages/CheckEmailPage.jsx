import { Link, useSearchParams } from 'react-router';
import { MailCheck } from 'lucide-react';
import { AuthHeading } from '../components/AuthHeading.jsx';
import { ResendConfirmation } from '../components/ResendConfirmation.jsx';
import { ar } from '../../../locales/ar.js';

/** After sign-up (or a login blocked by an unconfirmed email): check your inbox + resend. */
export default function CheckEmailPage() {
  const t = ar.auth.checkEmail;
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';

  return (
    <>
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-brand-subtle p-[18px] text-brand">
          <MailCheck size={30} aria-hidden="true" />
        </div>
      </div>
      <AuthHeading title={t.title} />
      <p className="mb-2 text-center text-body-md text-text-secondary">
        {email ? t.body(email) : t.bodyNoEmail}
      </p>
      <p className="mb-6 text-center text-body-sm text-muted">{t.notReceived}</p>

      <ResendConfirmation defaultEmail={email} />

      <p className="mt-6 text-center text-body-sm">
        <Link to="/login" className="font-semibold text-brand-text hover:underline">
          {ar.auth.backToLogin}
        </Link>
      </p>
    </>
  );
}
