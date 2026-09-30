import { useState } from 'react';
import { Link } from 'react-router';
import clsx from 'clsx';
import { AccountShell } from '../../../components/layout/AccountShell.jsx';
import { PageTopBar } from '../../../components/layout/PageTopBar.jsx';
import { IconPlus17 } from '../../../components/icons/index.js';
import { Badge } from '../../../components/ui/Badge.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { formatDate, formatPrice } from '../../../lib/format.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { PropertyPhoto } from '../components/PropertyPhoto.jsx';
import { RowActionsMenu } from '../components/RowActionsMenu.jsx';
import { OWNER_STATE_LABELS, OWNER_STATE_TONES, ownerStateOf } from '../listingState.js';
import { useGetMyPropertiesQuery } from '../propertiesApi.js';

const text = ar.myProperties;

// Figma tabs (75:717), right to left.
const TABS = ['all', 'published', 'pending', 'rejected'];

/** "نابلس — رفيديا" */
function placeOf(property) {
  if (property.region) return `${property.city} — ${property.region}`;
  return property.city;
}

/** The ⋮ menu: manage always; edit while the listing can change; the public page once live. */
function rowMenuItems(property, state) {
  const items = [{ label: text.manage, to: `/my-properties/${property.id}` }];
  if (state !== 'sold' && state !== 'rented') {
    items.push({ label: text.editDetails, to: `/my-properties/${property.id}/edit` });
  }
  if (state === 'published') {
    items.push({ label: text.viewPublic, to: `/properties/${property.id}` });
  }
  return items;
}

/**
 * Figma "عقاراتي — مستخدم" (75:592): title with the counts and «أضف عقار», the status tabs,
 * the table (photo 56×44, title + place, price, status badge, ⋮) and a red card per rejected
 * listing with its reason. Views and contact requests are not in the API, so the table shows
 * the date added instead. Below 1280px each listing is a card (not in Figma).
 */
export default function MyPropertiesPage() {
  const { data: properties, isLoading, error, refetch } = useGetMyPropertiesQuery();
  const [tab, setTab] = useState('all');

  const rows = [];
  const counts = { all: 0, published: 0, pending: 0, rejected: 0 };
  for (const property of properties ?? []) {
    const state = ownerStateOf(property);
    counts.all += 1;
    if (counts[state] !== undefined) counts[state] += 1;
    if (tab === 'all' || tab === state) rows.push({ property, state });
  }
  const rejected = (properties ?? []).filter((property) => ownerStateOf(property) === 'rejected');

  let content;
  if (isLoading) {
    content = <Skeleton className="h-[360px] rounded-lg" />;
  } else if (error) {
    const problem = toProblem(error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    content = <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />;
  } else if (counts.all === 0) {
    content = (
      <EmptyState
        title={text.emptyTitle}
        description={text.emptyText}
        action={{ label: text.emptyAction, to: '/properties/new' }}
      />
    );
  } else {
    content = (
      <>
        <div role="group" aria-label={text.tabsLabel} className="flex flex-wrap gap-2">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
              className={clsx(
                'rounded-full border px-[15px] py-[7px] text-[13px] leading-[1.72] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                tab === key && 'border-transparent bg-brand text-inverse',
                tab !== key && 'border-border bg-raised text-text-secondary hover:bg-inset',
              )}
            >
              {text.tab(text.tabs[key], counts[key])}
            </button>
          ))}
        </div>

        {rows.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-raised px-5 py-8 text-center text-[13.5px] leading-[1.75] text-text-secondary">
            {text.emptyTab}
          </p>
        )}

        {rows.length > 0 && (
          <>
            {/* Separate borders so the corners can be round without clipping the ⋮ menus. */}
            <div className="hidden rounded-lg border border-border bg-raised xl:block">
              <table className="w-full border-separate border-spacing-0 [&_td]:border-t [&_td]:border-border">
                <thead className="text-[12px] leading-[1.72] text-muted">
                  <tr className="[&_th]:bg-surface [&_th]:font-semibold">
                    <th
                      className="rounded-ss-[15px] py-[13px] ps-[18px] pe-2 text-start"
                      colSpan={2}
                    >
                      {text.property}
                    </th>
                    <th className="w-[116px] px-2 text-start">{text.price}</th>
                    <th className="w-[116px] px-2 text-start">{text.added}</th>
                    <th className="w-[126px] px-2 text-start">{text.status}</th>
                    <th className="w-[52px] rounded-se-[15px] pe-[18px]">
                      <span className="sr-only">{text.manage}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ property, state }) => (
                    <tr key={property.id}>
                      <td className="w-[74px] py-[13px] ps-[18px] pe-2">
                        <div className="h-11 w-14 overflow-hidden rounded-[9px]">
                          <PropertyPhoto src={property.mainImageUrl} />
                        </div>
                      </td>
                      <td className="py-[13px] pe-2">
                        <Link
                          to={`/my-properties/${property.id}`}
                          className="rounded-sm text-[14px] leading-[1.72] font-semibold text-text hover:text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
                        >
                          {property.title}
                        </Link>
                        <p className="text-[11.5px] leading-[1.72] text-muted">
                          {placeOf(property)}
                        </p>
                      </td>
                      <td className="px-2">
                        <span
                          dir="ltr"
                          className="text-[14px] leading-[1.72] font-bold whitespace-nowrap text-brand-text"
                        >
                          {formatPrice(property.price)}
                        </span>
                      </td>
                      <td className="px-2 text-[13.5px] leading-[1.72] font-semibold whitespace-nowrap text-text">
                        {formatDate(property.createdAtUtc)}
                      </td>
                      <td className="px-2">
                        <Badge tone={OWNER_STATE_TONES[state]}>{OWNER_STATE_LABELS[state]}</Badge>
                      </td>
                      <td className="pe-[18px]">
                        <RowActionsMenu
                          label={text.actions(property.title)}
                          items={rowMenuItems(property, state)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="flex flex-col gap-3 xl:hidden">
              {rows.map(({ property, state }) => (
                <li key={property.id}>
                  <Link
                    to={`/my-properties/${property.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-raised p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <div className="h-14 w-[72px] shrink-0 overflow-hidden rounded-[9px]">
                      <PropertyPhoto src={property.mainImageUrl} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="truncate text-[14px] leading-[1.72] font-semibold text-text">
                        {property.title}
                      </p>
                      <p className="text-[11.5px] leading-[1.72] text-muted">{placeOf(property)}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          dir="ltr"
                          className="text-[13.5px] leading-[1.72] font-bold text-brand-text"
                        >
                          {formatPrice(property.price)}
                        </span>
                        <Badge tone={OWNER_STATE_TONES[state]}>{OWNER_STATE_LABELS[state]}</Badge>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {rejected.map((property) => (
          <div
            key={property.id}
            className="flex flex-col gap-3 rounded-lg bg-danger-soft px-[18px] py-4 sm:flex-row sm:items-start"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <p className="text-[14px] leading-[1.72] font-bold text-text">
                {text.rejectionTitle(property.title)}
              </p>
              <p className="text-[13px] leading-[1.72] text-text-secondary">
                {property.rejectionReason}
              </p>
            </div>
            <Link
              to={`/my-properties/${property.id}`}
              className="shrink-0 rounded-sm text-[13px] leading-[1.72] font-semibold text-danger hover:underline focus-visible:outline-2 focus-visible:outline-brand"
            >
              {text.fixAndResend}
            </Link>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <PageTopBar title={text.title} backTo="/dashboard" />
      <AccountShell listingsCount={properties?.length}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h1 className="hidden text-[25px] leading-[1.72] font-bold text-text xl:block">
              {text.title}
            </h1>
            {counts.all > 0 && (
              <p className="text-[13.5px] leading-[1.72] text-text-secondary">
                {text.summary(counts.all, counts.published, counts.pending, counts.rejected)}
              </p>
            )}
          </div>
          <Link
            to="/properties/new"
            className="flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-[14.5px] leading-[1.72] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <IconPlus17 />
            {text.addProperty}
          </Link>
        </div>
        {content}
      </AccountShell>
    </>
  );
}
