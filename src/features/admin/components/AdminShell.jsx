import { NavLink } from 'react-router';
import clsx from 'clsx';
import {
  IconNavAi,
  IconNavProfile,
  IconNavQueue,
  IconNavReports,
  IconNavStats,
} from '../../../components/icons/index.js';
import { formatNumber } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';

const text = ar.admin.nav;

// Admin pages without an API yet stay in the list, not clickable, marked «قريباً».
const upcomingItems = [
  { label: text.users, Icon: IconNavProfile },
  { label: text.reports, Icon: IconNavReports },
  { label: text.aiUsage, Icon: IconNavAi },
];

const itemClasses =
  'flex items-center gap-2.5 rounded-md px-3.5 py-[11px] text-[14px] leading-[1.72] focus-visible:outline-2 focus-visible:outline-brand';

/**
 * The admin pages' frame — Figma "المحتوى" of «طابور الموافقات» (80:836): bg/surface with 70px
 * sides and, from 1280px up, the 268px admin sidebar (80:838) at the start. The queue item is
 * brand/subtle when active, with the waiting count in a danger pill.
 *
 * @param {{ pendingCount?: number, children: import('react').ReactNode }} props
 */
export function AdminShell({ pendingCount, children }) {
  return (
    <div className="min-h-full bg-surface">
      <div className="flex items-start gap-6 px-4 pt-4 pb-5 xl:px-[70px] xl:pt-[26px] xl:pb-[60px]">
        <nav
          aria-label={ar.nav.adminPanel}
          className="hidden w-[268px] shrink-0 flex-col gap-1.5 rounded-lg border border-border bg-raised px-[13px] py-[21px] xl:flex"
        >
          <span
            aria-disabled="true"
            className={clsx(itemClasses, 'cursor-default text-text-secondary')}
          >
            <IconNavStats className="shrink-0 text-muted" />
            {text.stats}
            <span className="flex-1" />
            <span className="rounded-full bg-inset px-2 py-0.5 text-[11px] leading-[1.72] font-semibold text-muted">
              {ar.accountNav.soon}
            </span>
          </span>
          <NavLink
            to="/admin/properties"
            className={({ isActive }) =>
              clsx(
                itemClasses,
                isActive && 'bg-brand-subtle font-semibold text-brand-text',
                !isActive && 'text-text-secondary hover:bg-inset',
              )
            }
          >
            <IconNavQueue className="shrink-0" />
            {text.queue}
            <span className="flex-1" />
            {pendingCount > 0 && (
              <span className="rounded-full bg-danger px-2 py-0.5 text-[11px] leading-[1.72] font-semibold text-inverse">
                {formatNumber(pendingCount)}
              </span>
            )}
          </NavLink>
          {upcomingItems.map(({ label, Icon }) => (
            <span
              key={label}
              aria-disabled="true"
              className={clsx(itemClasses, 'cursor-default text-text-secondary')}
            >
              <Icon className="shrink-0 text-muted" />
              {label}
              <span className="flex-1" />
              <span className="rounded-full bg-inset px-2 py-0.5 text-[11px] leading-[1.72] font-semibold text-muted">
                {ar.accountNav.soon}
              </span>
            </span>
          ))}
        </nav>
        <div className="flex min-w-0 flex-1 flex-col gap-5">{children}</div>
      </div>
    </div>
  );
}
