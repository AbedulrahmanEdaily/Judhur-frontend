import { Link } from 'react-router';
import clsx from 'clsx';
import { IconFieldChevron } from '../../../components/icons/index.js';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { formatDate, formatNumber } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { UserStatusBadge } from './UserStatusBadge.jsx';

const text = ar.admin.users;

/**
 * One user — Figma table row (82:952): 20×14, 16 apart; the 38px avatar, the name 14 semibold
 * with the email 11.5 muted, then the city (13 secondary), the listings (13.5 semibold), the
 * pending reports on them (danger when any) and the state badge. The whole row opens the user;
 * the ⋮ of Figma is a chevron here (the actions are on the user page). A banned user shows the
 * date and the reason under the email. On phones the numbers wrap under the name.
 *
 * @param {{ user: import('../../../api/types.js').AdminUser }} props
 */
export function UserRow({ user }) {
  return (
    <Link
      to={`/admin/users/${user.id}`}
      aria-label={text.open(user.fullName)}
      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand xl:flex-nowrap xl:px-5"
    >
      <Avatar
        name={user.fullName}
        imageUrl={user.profileImageUrl}
        sizeClassName="size-[38px] text-[15px]"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[14px] leading-[1.72] font-semibold text-text">
          {user.fullName}
        </span>
        <span dir="ltr" className="truncate text-end text-[11.5px] leading-[1.72] text-muted">
          {user.email}
        </span>
        {user.bannedAtUtc && (
          <span className="text-[12px] leading-[1.72] text-danger">
            {text.bannedOn(formatDate(user.bannedAtUtc))}
            {user.banReason && ` — ${user.banReason}`}
          </span>
        )}
      </span>
      <span className="hidden w-[80px] shrink-0 truncate text-[13px] leading-[1.72] text-text-secondary xl:block">
        {user.city}
      </span>
      <span className="flex w-full items-center gap-4 ps-[54px] xl:contents">
        <span className="text-[13.5px] leading-[1.72] font-semibold text-text xl:w-[60px] xl:shrink-0">
          <span aria-hidden="true">{formatNumber(user.propertiesCount)}</span>
          <span className="sr-only">{text.listingsCount(formatNumber(user.propertiesCount))}</span>
          <span aria-hidden="true" className="ms-1 font-normal text-muted xl:hidden">
            {text.columns.listings}
          </span>
        </span>
        <span
          className={clsx(
            'text-[13.5px] leading-[1.72] font-semibold xl:w-[60px] xl:shrink-0',
            user.pendingReportsOnListings > 0 ? 'text-danger' : 'text-muted',
          )}
        >
          <span aria-hidden="true">{formatNumber(user.pendingReportsOnListings)}</span>
          <span className="sr-only">
            {text.pendingReports(formatNumber(user.pendingReportsOnListings))}
          </span>
          <span aria-hidden="true" className="ms-1 font-normal text-muted xl:hidden">
            {text.columns.reports}
          </span>
        </span>
        <span className="flex flex-1 xl:w-[90px] xl:flex-none">
          <UserStatusBadge user={user} />
        </span>
        <IconFieldChevron className="shrink-0 rotate-90 text-muted" />
      </span>
    </Link>
  );
}
