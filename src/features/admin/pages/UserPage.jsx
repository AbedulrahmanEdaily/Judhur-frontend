import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { IconBackChevron, IconLock } from '../../../components/icons/index.js';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { formatDate } from '../../../lib/format.js';
import { actionErrorMessage, toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { AdminShell } from '../components/AdminShell.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { UserStatusBadge } from '../components/UserStatusBadge.jsx';
import { useBanUserMutation, useGetAdminUserQuery, useUnbanUserMutation } from '../usersApi.js';

const text = ar.admin.users;
const MAX_BAN_REASON_LENGTH = 500;

const cardClasses = 'flex flex-col gap-4 rounded-lg border border-border bg-raised p-4 xl:p-[22px]';

/** One line of the profile list. */
function renderDetail(label, value) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[12px] leading-[1.72] text-muted">{label}</dt>
      <dd className="text-[14px] leading-[1.72] text-text">{value}</dd>
    </div>
  );
}

/**
 * `/admin/users/:userId` (no Figma frame — the user table's row and cards): the user, their
 * counts, and «الحظر»: «حظر الحساب» with a required reason (≤ 500, shown to the user, a
 * counter) behind a confirm dialog that says what a ban does, or, while banned, the date, the
 * reason and «إلغاء الحظر» behind a confirm. Admin accounts can't be banned. A 409
 * (Users.CannotBanAdmin / CannotBanSelf / AlreadyBanned / NotBanned) shows the server's message
 * and the user is fetched again.
 */
export default function UserPage() {
  const { userId } = useParams();
  const toast = useToast();
  const { data: user, isLoading, error, refetch } = useGetAdminUserQuery(userId);
  const [banUser, { isLoading: isBanning }] = useBanUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanUserMutation();
  const [openDialog, setOpenDialog] = useState(null);

  async function confirmBan(reason) {
    try {
      await banUser({ userId, reason }).unwrap();
      toast.show({ tone: 'success', message: text.banned(user.fullName) });
    } catch (banError) {
      toast.show({ tone: 'error', message: actionErrorMessage(banError) });
    }
    setOpenDialog(null);
  }

  async function confirmUnban() {
    try {
      await unbanUser(userId).unwrap();
      toast.show({ tone: 'success', message: text.unbanned(user.fullName) });
    } catch (unbanError) {
      toast.show({ tone: 'error', message: actionErrorMessage(unbanError) });
    }
    setOpenDialog(null);
  }

  const backLink = (
    <Link
      to="/admin/users"
      className="flex items-center gap-1 self-start rounded-sm text-[13px] leading-[1.72] font-semibold text-brand-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <IconBackChevron width={16} height={16} className="shrink-0" />
      {text.backToList}
    </Link>
  );

  let content;
  if (isLoading) {
    content = (
      <>
        <Skeleton className="h-[180px] rounded-lg" />
        <Skeleton className="h-[120px] rounded-lg" />
      </>
    );
  } else if (error && toProblem(error).status === 404) {
    content = (
      <EmptyState
        title={text.notFoundTitle}
        description={text.notFoundText}
        action={{ label: text.backToList, to: '/admin/users' }}
      />
    );
  } else if (error) {
    const problem = toProblem(error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    content = <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />;
  } else {
    let phone = text.noPhone;
    if (user.phoneNumber) phone = <span dir="ltr">{user.phoneNumber}</span>;
    let emailState = text.details.notConfirmed;
    if (user.emailConfirmed) emailState = text.details.confirmed;

    let banSection;
    if (user.isAdmin) {
      banSection = (
        <p className="text-[13.5px] leading-[1.72] text-text-secondary">{text.adminNote}</p>
      );
    } else if (user.bannedAtUtc) {
      banSection = (
        <>
          <div className="flex flex-col gap-1 rounded-md bg-danger-soft px-4 py-3 text-danger">
            <p className="text-[13.5px] leading-[1.72] font-semibold">
              {text.bannedAt(formatDate(user.bannedAtUtc))}
            </p>
            {user.banReason && (
              <p className="text-[13px] leading-[1.72] whitespace-pre-line">
                {`${text.banReason}: ${user.banReason}`}
              </p>
            )}
          </div>
          <Button variant="secondary" onClick={() => setOpenDialog('unban')} className="self-start">
            {text.unban}
          </Button>
        </>
      );
    } else {
      banSection = (
        <Button variant="danger" onClick={() => setOpenDialog('ban')} className="self-start">
          {text.ban}
        </Button>
      );
    }

    content = (
      <>
        <section className={cardClasses}>
          <div className="flex items-center gap-4">
            <Avatar
              name={user.fullName}
              imageUrl={user.profileImageUrl}
              sizeClassName="size-[56px] text-[22px] xl:size-[68px] xl:text-[26px]"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] leading-[1.72] font-bold text-text xl:text-[23px]">
                  {user.fullName}
                </h1>
                <UserStatusBadge user={user} />
              </div>
              <p dir="ltr" className="truncate text-end text-[13px] leading-[1.72] text-muted">
                {user.email}
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 xl:grid-cols-4">
            {renderDetail(text.details.phone, phone)}
            {renderDetail(text.details.city, user.city)}
            {renderDetail(text.details.memberSince, formatDate(user.createdAtUtc))}
            {renderDetail(text.details.emailConfirmed, emailState)}
          </dl>
          {!user.isAdmin && !user.bannedAtUtc && (
            <Link
              to={`/sellers/${user.id}`}
              className="self-start rounded-sm text-[13px] leading-[1.72] font-semibold text-brand-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {text.sellerPage}
            </Link>
          )}
        </section>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:gap-4">
          <StatCard label={text.details.listings} value={user.propertiesCount} />
          <StatCard label={text.details.activeListings} value={user.activeListingsCount} />
          <StatCard label={text.details.pendingReports} value={user.pendingReportsOnListings} />
        </div>

        <section aria-labelledby="user-ban" className={cardClasses}>
          <h2 id="user-ban" className="text-[16px] leading-[1.72] font-bold text-text">
            {text.banTitle}
          </h2>
          {banSection}
        </section>

        <ConfirmDialog
          open={openDialog === 'ban'}
          onClose={() => setOpenDialog(null)}
          onConfirm={confirmBan}
          title={text.banDialog.title(user.fullName)}
          description={text.banDialog.description}
          confirmLabel={text.banDialog.confirm}
          icon={IconLock}
          reason={{
            label: text.banDialog.reasonLabel,
            placeholder: text.banDialog.reasonPlaceholder,
            maxLength: MAX_BAN_REASON_LENGTH,
          }}
          loading={isBanning}
        />
        <ConfirmDialog
          open={openDialog === 'unban'}
          onClose={() => setOpenDialog(null)}
          onConfirm={confirmUnban}
          title={text.unbanDialog.title(user.fullName)}
          description={text.unbanDialog.description}
          confirmLabel={text.unbanDialog.confirm}
          tone="warning"
          icon={IconLock}
          loading={isUnbanning}
        />
      </>
    );
  }

  return (
    <AdminShell>
      {backLink}
      {content}
    </AdminShell>
  );
}
