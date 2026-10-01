import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { AccountShell } from '../../../components/layout/AccountShell.jsx';
import { PageTopBar } from '../../../components/layout/PageTopBar.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { AdminShell } from '../../admin/components/AdminShell.jsx';
import { selectIsAdmin } from '../../auth/authSlice.js';
import { useGetMyPropertiesQuery } from '../../properties/propertiesApi.js';
import { PasswordForm } from '../components/PasswordForm.jsx';
import { ProfileDetailsForm } from '../components/ProfileDetailsForm.jsx';
import { useMyProfile } from '../useMyProfile.js';

const text = ar.profile;

/**
 * Figma "الملف الشخصي — مستخدم" (79:1500): the title and its line, «البيانات الشخصية» (photo,
 * name, city, email, phone, bio) and «الأمان» (password). Users get the account sidebar with
 * «الملف الشخصي» active; admins the admin sidebar. «التفضيلات» and «حذف الحساب» have no API
 * and are left out.
 */
export default function ProfilePage() {
  const isAdmin = useSelector(selectIsAdmin);
  const { profile, isLoading, error, refetch } = useMyProfile();
  const myProperties = useGetMyPropertiesQuery(undefined, { skip: isAdmin });

  let content;
  if (isLoading) {
    content = (
      <>
        <Skeleton className="h-[476px] rounded-lg" />
        <Skeleton className="h-[200px] rounded-lg" />
      </>
    );
  } else if (error) {
    const problem = toProblem(error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    content = <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />;
  } else if (profile) {
    content = (
      <>
        <ProfileDetailsForm profile={profile} />
        {/* A new key after a first password is set, so the form switches to «تغيير». */}
        <PasswordForm key={String(profile.hasPassword)} hasPassword={profile.hasPassword} />
      </>
    );
  }

  const body = (
    <>
      <div className="flex flex-col gap-0.5">
        <h1 className="hidden text-[25px] leading-[1.72] font-bold text-text xl:block">
          {text.title}
        </h1>
        {/* Admins have no listings, so no public seller page to look at. */}
        <p className="text-[13.5px] leading-[1.72] text-text-secondary">
          {text.subtitle}{' '}
          {profile && !isAdmin && (
            <Link
              to={`/sellers/${profile.id}`}
              className="rounded-sm font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
            >
              {text.viewPublic}
            </Link>
          )}
        </p>
      </div>
      {content}
    </>
  );

  if (isAdmin) {
    return (
      <>
        <PageTopBar title={text.title} backTo="/admin/properties" />
        <AdminShell>{body}</AdminShell>
      </>
    );
  }
  return (
    <>
      <PageTopBar title={text.title} backTo="/dashboard" />
      <AccountShell listingsCount={myProperties.data?.length}>{body}</AccountShell>
    </>
  );
}
