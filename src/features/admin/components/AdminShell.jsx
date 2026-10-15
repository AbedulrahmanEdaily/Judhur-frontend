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
const aiUsageItem = { label: text.aiUsage, Icon: IconNavAi };

const itemClasses =
  'flex items-center gap-2.5 rounded-md px-3.5 py-[11px] text-[14px] leading-[1.72] focus-visible:outline-2 focus-visible:outline-brand';

function navItemClasses({ isActive }) {
  return clsx(
    itemClasses,
    isActive && 'bg-brand-subtle font-semibold text-brand-text',
    !isActive && 'text-text-secondary hover:bg-inset',
  );
}

function renderUpcomingItem({ label, Icon }) {
  return (
    <span aria-disabled="true" className={clsx(itemClasses, 'cursor-default text-text-secondary')}>
      <Icon className="shrink-0 text-muted" />
      {label}
      <span className="flex-1" />
      <span className="rounded-full bg-inset px-2 py-0.5 text-[11px] leading-[1.72] font-semibold text-muted">
        {ar.accountNav.soon}
      </span>
    </span>
  );
}

/** The danger count pill of «طابور الموافقات» and «البلاغات» (82:1118, 82:1130). */
function renderCount(count) {
  if (!(count > 0)) return null;
  return (
    <span className="rounded-full bg-danger px-2 py-0.5 text-[11px] leading-[1.72] font-semibold text-inverse">
      {formatNumber(count)}
    </span>
  );
}

/**
 * The admin pages' frame — Figma "المحتوى" of «لوحة الإحصائيات» (80:602), «طابور الموافقات»
 * (80:836), «إدارة المستخدمين» (82:910) and «البلاغات» (82:1109): bg/surface with 70px sides
 * and, from 1280px up, the 268px admin sidebar (80:838) at the start. The open item is brand/subtle; the queue and the reports show their waiting
 * count in a danger pill when the page knows it.
 *
 * @param {{
 *   pendingCount?: number,
 *   openReportsCount?: number,
 *   children: import('react').ReactNode,
 * }} props
 */
export function AdminShell({ pendingCount, openReportsCount, children }) {
  return (
    <div className="min-h-full bg-surface">
      <div className="flex items-start gap-6 px-4 pt-4 pb-5 xl:px-[70px] xl:pt-[26px] xl:pb-[60px]">
        <nav
          aria-label={ar.nav.adminPanel}
          className="hidden w-[268px] shrink-0 flex-col gap-1.5 rounded-lg border border-border bg-raised px-[13px] py-[21px] xl:flex"
        >
          <NavLink to="/admin" end className={navItemClasses}>
            <IconNavStats className="shrink-0" />
            {text.stats}
          </NavLink>
          <NavLink to="/admin/properties" className={navItemClasses}>
            <IconNavQueue className="shrink-0" />
            {text.queue}
            <span className="flex-1" />
            {renderCount(pendingCount)}
          </NavLink>
          <NavLink to="/admin/users" className={navItemClasses}>
            <IconNavProfile className="shrink-0" />
            {text.users}
          </NavLink>
          <NavLink to="/admin/reports" className={navItemClasses}>
            <IconNavReports className="shrink-0" />
            {text.reports}
            <span className="flex-1" />
            {renderCount(openReportsCount)}
          </NavLink>
          {renderUpcomingItem(aiUsageItem)}
        </nav>
        <div className="flex min-w-0 flex-1 flex-col gap-5">{children}</div>
      </div>
    </div>
  );
}
