import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { AccountShell } from '../../../components/layout/AccountShell.jsx';
import { PageTopBar } from '../../../components/layout/PageTopBar.jsx';
import {
  IconAlertBell,
  IconFieldChevron,
  IconNavNotifications,
  IconPlus17,
  IconRowChats,
  IconRowFavorites,
  IconRowListings,
  IconRowProfile,
  IconStatFavorites,
  IconStatListings,
  IconStatViews,
} from '../../../components/icons/index.js';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { selectCurrentUser } from '../../auth/authSlice.js';
import { useLogout } from '../../auth/hooks/useLogout.js';
import { useFavoriteIds } from '../../favorites/useFavoriteIds.js';
import { useMyProfile } from '../../profile/useMyProfile.js';
import { useUnreadCount } from '../../notifications/useUnreadCount.js';
import { PropertyPhoto } from '../../properties/components/PropertyPhoto.jsx';
import {
  OWNER_STATE_LABELS,
  OWNER_STATE_TONES,
  ownerStateOf,
} from '../../properties/listingState.js';
import { useGetMyPropertiesQuery, useGetPropertiesQuery } from '../../properties/propertiesApi.js';
import { formatNumber, formatPrice } from '../../../lib/format.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';

const text = ar.dashboard;
const nav = ar.accountNav;

// The same query as the home page's latest listings, so the cache is shared.
const LATEST_QUERY = 'pageSize=4';

const addButtonClasses =
  'flex items-center gap-2 rounded-md bg-brand px-5 py-3 text-[14.5px] leading-[1.72] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';
const cardClasses = 'rounded-lg border border-border bg-raised';

/**
 * Figma "لوحتي — مستخدم" (74:472) and mobile (84:575), buyer first: everyone gets the welcome,
 * the saved count and the latest listings; the listing stats, the review alert and «آخر
 * عقاراتك» appear only once the user has a listing (never an empty seller dashboard).
 * Views, contact requests and messages are not in the API: those Figma parts are replaced by
 * «منشور للعامة» and «أحدث العقارات». The welcome and the mobile avatar come from `GET /me`.
 */
export default function DashboardPage() {
  const user = useSelector(selectCurrentUser);
  const { logout, isLoggingOut } = useLogout();
  const mine = useGetMyPropertiesQuery();
  const favorites = useFavoriteIds();
  const unread = useUnreadCount();
  const { profile } = useMyProfile();
  const latest = useGetPropertiesQuery(LATEST_QUERY);

  const myProperties = mine.data ?? [];

  // «مرحباً محمد» with the first name once the profile is loaded.
  let welcome = text.welcome;
  if (profile) welcome = text.welcomeName(profile.fullName.trim().split(/\s+/)[0]);
  let avatarName = user?.email ?? '';
  if (profile) avatarName = profile.fullName;
  const hasListings = myProperties.length > 0;
  let publishedCount = 0;
  let firstPending = null;
  for (const property of myProperties) {
    const state = ownerStateOf(property);
    if (state === 'published') publishedCount += 1;
    if (state === 'pending' && !firstPending) firstPending = property;
  }
  const favoritesCount = favorites.count;

  let subtitle = text.buyerSubtitle;
  if (hasListings) subtitle = text.subtitle;

  const stats = [];
  if (hasListings) {
    stats.push({
      key: 'listings',
      Icon: IconStatListings,
      value: myProperties.length,
      label: text.stats.listings,
      mobileLabel: text.mobileStats.listings,
    });
    stats.push({
      key: 'published',
      Icon: IconStatViews,
      value: publishedCount,
      label: text.stats2.published,
      mobileLabel: text.mobileStats2.published,
    });
  }
  stats.push({
    key: 'favorites',
    Icon: IconStatFavorites,
    value: favoritesCount,
    label: text.stats.favorites,
    mobileLabel: text.mobileStats.favorites,
  });

  let mineBlock = null;
  if (mine.isLoading) {
    mineBlock = <Skeleton className="h-[160px] rounded-lg" />;
  } else if (mine.error) {
    const problem = toProblem(mine.error);
    mineBlock = <ErrorState message={problem.message} onRetry={mine.refetch} />;
  }

  let latestRows = <Skeleton className="h-[180px] rounded-md" />;
  if (latest.error) {
    latestRows = <ErrorState message={toProblem(latest.error).message} onRetry={latest.refetch} />;
  } else if (latest.data && latest.data.items.length === 0) {
    latestRows = (
      <p className="py-4 text-[13.5px] leading-[1.72] text-text-secondary">{text.latestEmpty}</p>
    );
  } else if (latest.data) {
    latestRows = (
      <ul>
        {latest.data.items.map((property) => (
          <li key={property.id}>
            <Link
              to={`/properties/${property.id}`}
              className="flex items-center gap-3 rounded-md py-2.5 focus-visible:outline-2 focus-visible:outline-brand"
            >
              <span className="h-[42px] w-[52px] shrink-0 overflow-hidden rounded-[10px]">
                <PropertyPhoto src={property.mainImageUrl} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13.5px] leading-[1.72] font-semibold text-text">
                {property.title}
              </span>
              <span
                dir="ltr"
                className="shrink-0 text-[12.5px] leading-[1.72] font-bold text-brand-text"
              >
                {formatPrice(property.price)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  const latestCard = (
    <section
      className={`${cardClasses} flex flex-1 flex-col gap-3.5 px-[21px] pt-[21px] pb-[19px]`}
    >
      <div className="flex items-center gap-3">
        <h2 className="flex-1 text-[17px] leading-[1.72] font-bold text-text">{text.latest}</h2>
        <Link
          to="/properties"
          className="rounded-sm text-[12.5px] leading-[1.72] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
        >
          {text.seeAll}
        </Link>
      </div>
      {latestRows}
    </section>
  );

  return (
    <>
      <PageTopBar title={text.title} backTo="/" />
      <AccountShell listingsCount={mine.data?.length}>
        {/* Welcome — desktop (74:635) and the mobile card (84:586). */}
        <div className="hidden items-center gap-3 xl:flex">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h1 className="text-[26px] leading-[1.72] font-bold text-text">{welcome}</h1>
            <p className="text-[14px] leading-[1.72] text-text-secondary">{subtitle}</p>
          </div>
          <Link to="/properties/new" className={addButtonClasses}>
            <IconPlus17 />
            {ar.myProperties.addProperty}
          </Link>
        </div>
        <div className={`${cardClasses} flex items-center gap-3 p-[15px] xl:hidden`}>
          <Avatar name={avatarName} imageUrl={profile?.profileImageUrl} />
          <div className="flex min-w-0 flex-1 flex-col gap-px">
            <p className="text-[17px] leading-[1.72] font-bold text-text">{welcome}</p>
            <p className="text-[12.5px] leading-[1.72] text-muted">{subtitle}</p>
          </div>
        </div>

        {/* Stats — desktop cards (74:644) and the small mobile ones (84:592). */}
        <ul className="hidden gap-4 xl:flex">
          {stats.map(({ key, Icon, value, label }) => (
            <li key={key} className={`${cardClasses} flex flex-1 flex-col gap-2.5 p-[19px]`}>
              <span className="self-start rounded-full bg-brand-subtle p-2 text-brand">
                <Icon />
              </span>
              <p className="text-[26px] leading-[1.72] font-bold text-text">
                {formatNumber(value)}
              </p>
              <p className="text-[12.5px] leading-[1.72] text-muted">{label}</p>
            </li>
          ))}
        </ul>
        <ul className="flex gap-3 xl:hidden">
          {stats.map(({ key, value, mobileLabel }) => (
            <li
              key={key}
              className={`${cardClasses} flex flex-1 flex-col gap-0.5 px-[11px] py-[13px] text-center`}
            >
              <p className="text-[19px] leading-[1.72] font-bold text-text">
                {formatNumber(value)}
              </p>
              <p className="text-[11px] leading-[1.72] text-muted">{mobileLabel}</p>
            </li>
          ))}
        </ul>

        {mineBlock}

        {/* Review alert, desktop (74:677). */}
        {firstPending && (
          <Link
            to={`/my-properties/${firstPending.id}`}
            className="hidden items-center gap-3 rounded-lg bg-warning-soft px-[18px] py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand xl:flex"
          >
            <span className="rounded-full bg-warning p-1.5 text-inverse">
              <IconAlertBell />
            </span>
            <span className="flex-1 text-[13.5px] leading-[1.72] font-semibold text-text">
              {text.pendingAlert(firstPending.title)}
            </span>
            <span className="text-[13px] leading-[1.72] font-semibold text-warning">
              {text.viewDetails}
            </span>
          </Link>
        )}

        {/* The mobile list (84:602): the account pages, then logout (not in Figma). */}
        <ul className={`${cardClasses} divide-y divide-border xl:hidden`}>
          <li>
            <Link
              to="/my-properties"
              className="flex items-center gap-3 px-4 py-[15px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
            >
              <IconRowListings className="shrink-0 text-muted" />
              <span className="text-[14.5px] leading-[1.72] text-text">{nav.myProperties}</span>
              <span className="flex-1" />
              {hasListings && (
                <span className="rounded-full bg-inset px-2 py-0.5 text-[11px] leading-[1.72] font-semibold text-muted">
                  {formatNumber(myProperties.length)}
                </span>
              )}
              <IconFieldChevron className="shrink-0 rotate-90 text-muted" />
            </Link>
          </li>
          <li>
            <Link
              to="/favorites"
              className="flex items-center gap-3 px-4 py-[15px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
            >
              <IconRowFavorites className="shrink-0 text-muted" />
              <span className="text-[14.5px] leading-[1.72] text-text">{nav.favorites}</span>
              <span className="flex-1" />
              {favorites.isLoaded && (
                <span className="rounded-full bg-inset px-2 py-0.5 text-[11px] leading-[1.72] font-semibold text-muted">
                  {formatNumber(favoritesCount)}
                </span>
              )}
              <IconFieldChevron className="shrink-0 rotate-90 text-muted" />
            </Link>
          </li>
          <li aria-disabled="true" className="flex items-center gap-3 px-4 py-[15px]">
            <IconRowChats className="shrink-0 text-muted" />
            <span className="text-[14.5px] leading-[1.72] text-text-secondary">{nav.chats}</span>
            <span className="flex-1" />
            <span className="rounded-full bg-inset px-2 py-0.5 text-[11px] leading-[1.72] font-semibold text-muted">
              {nav.soon}
            </span>
          </li>
          {/* Not in the mobile Figma list: the notifications page has no other way in on a phone. */}
          <li>
            <Link
              to="/notifications"
              className="flex items-center gap-3 px-4 py-[15px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
            >
              <IconNavNotifications width={19} height={19} className="shrink-0 text-muted" />
              <span className="text-[14.5px] leading-[1.72] text-text">{nav.notifications}</span>
              <span className="flex-1" />
              {unread.count > 0 && (
                <span className="rounded-full bg-inset px-2 py-0.5 text-[11px] leading-[1.72] font-semibold text-muted">
                  {formatNumber(unread.count)}
                </span>
              )}
              <IconFieldChevron className="shrink-0 rotate-90 text-muted" />
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-[15px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
            >
              <IconRowProfile className="shrink-0 text-muted" />
              <span className="text-[14.5px] leading-[1.72] text-text">{nav.profile}</span>
              <span className="flex-1" />
              <IconFieldChevron className="shrink-0 rotate-90 text-muted" />
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={logout}
              disabled={isLoggingOut}
              className="w-full px-4 py-[15px] text-start text-[14.5px] leading-[1.72] font-semibold text-danger focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
            >
              {nav.logout}
            </button>
          </li>
        </ul>

        {/* Review alert, mobile (84:640) — under the list, as in Figma. */}
        {firstPending && (
          <Link
            to={`/my-properties/${firstPending.id}`}
            className="rounded-lg bg-warning-soft p-3.5 text-[12.5px] leading-[1.72] font-semibold text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand xl:hidden"
          >
            {text.mobilePendingAlert(firstPending.title)}
          </Link>
        )}

        {!hasListings && !mine.isLoading && !mine.error && (
          <section
            className={`${cardClasses} flex flex-col items-start gap-3 bg-brand-subtle p-5 sm:flex-row sm:items-center`}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h2 className="text-[17px] leading-[1.72] font-bold text-text">{text.sellTitle}</h2>
              <p className="text-[13.5px] leading-[1.72] text-text-secondary">{text.sellText}</p>
            </div>
            <Link to="/properties/new" className={addButtonClasses}>
              <IconPlus17 />
              {ar.myProperties.addProperty}
            </Link>
          </section>
        )}

        {/* Two columns (74:684): «آخر عقاراتك» (sellers) and «أحدث العقارات». */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
          {hasListings && (
            <section
              className={`${cardClasses} flex flex-1 flex-col gap-3.5 px-[21px] pt-[21px] pb-[19px]`}
            >
              <div className="flex items-center gap-3">
                <h2 className="flex-1 text-[17px] leading-[1.72] font-bold text-text">
                  {text.myLatest}
                </h2>
                <Link
                  to="/my-properties"
                  className="rounded-sm text-[12.5px] leading-[1.72] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
                >
                  {nav.myProperties}
                </Link>
              </div>
              <ul>
                {myProperties.slice(0, 3).map((property) => {
                  const state = ownerStateOf(property);
                  return (
                    <li key={property.id}>
                      <Link
                        to={`/my-properties/${property.id}`}
                        className="flex items-center gap-3 rounded-md py-2.5 focus-visible:outline-2 focus-visible:outline-brand"
                      >
                        <span className="h-[42px] w-[52px] shrink-0 overflow-hidden rounded-[10px]">
                          <PropertyPhoto src={property.mainImageUrl} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13.5px] leading-[1.72] font-semibold text-text">
                          {property.title}
                        </span>
                        <Badge tone={OWNER_STATE_TONES[state]}>{OWNER_STATE_LABELS[state]}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {latestCard}
        </div>
      </AccountShell>
    </>
  );
}
