import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import clsx from 'clsx';
import { IconSearch } from '../../../components/icons/index.js';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { formatNumber } from '../../../lib/format.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { AdminShell } from '../components/AdminShell.jsx';
import { UserRow } from '../components/UserRow.jsx';
import { useGetAdminUsersQuery } from '../usersApi.js';

const text = ar.admin.users;
const PAGE_SIZE = 20;
const STATUSES = ['All', 'Active', 'Banned', 'Unconfirmed'];
const SEARCH_DELAY_MS = 400;
const MAX_SEARCH_LENGTH = 100;

/** `?page=` as a whole number from 1. */
function readPage(searchParams) {
  const page = Math.floor(Number(searchParams.get('page')));
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

/** `?status=` when it is one of the four, else All. */
function readStatus(searchParams) {
  const status = searchParams.get('status');
  if (STATUSES.includes(status)) return status;
  return 'All';
}

/** The URL of a list view; the defaults are left out. */
function listParams(status, search, page) {
  const params = new URLSearchParams();
  if (status !== 'All') params.set('status', status);
  if (search) params.set('search', search);
  if (page > 1) params.set('page', String(page));
  return params;
}

/**
 * Figma "إدارة المستخدمين — أدمن" (82:827): the title, the search box (260 × 42) at the end,
 * then the users table. Not in Figma: the status tabs (`?status=`), the count line, the
 * pagination (20 a page, `?page=`) and the empty states. The search (`?search=`, by name,
 * email or phone) is sent 400 ms after typing stops and starts again from page 1.
 */
export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  const status = readStatus(searchParams);
  const search = searchParams.get('search') ?? '';
  const [typed, setTyped] = useState(search);
  // The URL changed by itself (back / forward, a tab): show its search in the box.
  const [shownSearch, setShownSearch] = useState(search);
  if (search !== shownSearch) {
    setShownSearch(search);
    if (typed.trim() !== search) setTyped(search);
  }
  const { data, isLoading, isFetching, error, refetch } = useGetAdminUsersQuery({
    search,
    status,
    page,
    pageSize: PAGE_SIZE,
  });

  // Send the search once typing pauses.
  useEffect(() => {
    const trimmed = typed.trim();
    if (trimmed === search) return undefined;
    const timer = setTimeout(() => {
      setSearchParams(listParams(status, trimmed, 1), { replace: true });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [typed, search, status, setSearchParams]);

  function show(nextStatus, nextPage) {
    setSearchParams(listParams(nextStatus, search, nextPage));
    window.scrollTo({ top: 0 });
  }

  function clearSearch() {
    setTyped('');
    setSearchParams(listParams(status, '', 1));
  }

  let content;
  if (isLoading) {
    content = <Skeleton className="h-[360px] rounded-lg" />;
  } else if (error) {
    const problem = toProblem(error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    content = <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />;
  } else if (data.items.length === 0 && page > 1) {
    content = (
      <EmptyState
        title={text.emptyTitle}
        action={{ label: text.backToFirstPage, onClick: () => show(status, 1) }}
      />
    );
  } else if (data.items.length === 0 && search) {
    content = (
      <EmptyState
        title={text.emptyTitle}
        description={text.emptySearch(search)}
        action={{ label: text.clearSearch, onClick: clearSearch }}
      />
    );
  } else if (data.items.length === 0) {
    content = <EmptyState title={text.emptyTitle} />;
  } else {
    content = (
      <>
        <div className="overflow-hidden rounded-lg border border-border bg-raised">
          <div
            aria-hidden="true"
            className="hidden items-center gap-4 border-b border-border px-5 py-2.5 text-[12px] leading-[1.72] text-muted xl:flex"
          >
            <span className="w-[38px] shrink-0" />
            <span className="flex-1" />
            <span className="w-[80px] shrink-0">{text.columns.city}</span>
            <span className="w-[60px] shrink-0">{text.columns.listings}</span>
            <span className="w-[60px] shrink-0">{text.columns.reports}</span>
            <span className="w-[90px] shrink-0">{text.columns.status}</span>
            <span className="w-4 shrink-0" />
          </div>
          <ul aria-busy={isFetching || undefined} className="divide-y divide-border">
            {data.items.map((user) => (
              <li key={user.id}>
                <UserRow user={user} />
              </li>
            ))}
          </ul>
        </div>
        <Pagination
          page={data.pageNumber}
          totalPages={data.totalPages}
          onPageChange={(nextPage) => show(status, nextPage)}
        />
      </>
    );
  }

  return (
    <AdminShell>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex flex-1 flex-col gap-0.5">
          <h1 className="text-[22px] leading-[1.72] font-bold text-text xl:text-[25px]">
            {text.title}
          </h1>
          {data && (
            <p className="text-[13.5px] leading-[1.72] text-text-secondary">
              {text.subtitle(formatNumber(data.totalCount))}
            </p>
          )}
        </div>
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="flex h-[42px] items-center gap-2 rounded-md border border-border bg-raised px-3.5 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand xl:w-[260px]"
        >
          <input
            type="search"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            maxLength={MAX_SEARCH_LENGTH}
            aria-label={text.searchLabel}
            placeholder={text.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-[13px] leading-[1.72] text-text outline-none placeholder:text-muted"
          />
          <IconSearch className="shrink-0 text-muted" />
        </form>
      </div>

      <nav aria-label={text.tabs} className="flex flex-wrap gap-2">
        {STATUSES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => show(value, 1)}
            aria-current={value === status ? 'page' : undefined}
            className={clsx(
              'rounded-full border px-4 py-1.5 text-[13px] leading-[1.72] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
              value === status && 'border-brand bg-brand-subtle font-semibold text-brand-text',
              value !== status && 'border-border bg-raised text-text-secondary hover:bg-inset',
            )}
          >
            {text.statuses[value]}
          </button>
        ))}
      </nav>

      {content}
    </AdminShell>
  );
}
