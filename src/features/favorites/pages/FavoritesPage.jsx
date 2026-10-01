import { useSearchParams } from 'react-router';
import { AccountShell } from '../../../components/layout/AccountShell.jsx';
import { PageTopBar } from '../../../components/layout/PageTopBar.jsx';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { formatNumber } from '../../../lib/format.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { PropertyCard } from '../../properties/components/PropertyCard.jsx';
import { PropertyCardSkeleton } from '../../properties/components/PropertyCardSkeleton.jsx';
import { useGetMyPropertiesQuery } from '../../properties/propertiesApi.js';
import { useGetFavoritesQuery } from '../favoritesApi.js';
import { useFavoriteIds } from '../useFavoriteIds.js';

const text = ar.favorites;
const PAGE_SIZE = 12;

/** `?page=` as a whole number from 1. */
function readPage(searchParams) {
  const page = Math.floor(Number(searchParams.get('page')));
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

/**
 * Figma "المفضلة — مستخدم" (75:815): the account sidebar, «المفضلة» with the count, and the
 * saved listings as Property Cards, three per row (gap 20), newest first. A card whose heart is
 * turned off leaves at once: the list is filtered by the ids (updated optimistically) while the
 * page refetches.
 */
export default function FavoritesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  const { data, isLoading, error, refetch } = useGetFavoritesQuery({ page, pageSize: PAGE_SIZE });
  const { favoriteIds, isLoaded: idsLoaded } = useFavoriteIds();
  const myProperties = useGetMyPropertiesQuery();

  function changePage(nextPage) {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set('page', String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 0 });
  }

  let items = [];
  if (data) items = data.items;
  if (idsLoaded) items = items.filter((property) => favoriteIds.has(property.id));

  let content;
  if (isLoading) {
    content = (
      <div className="grid gap-3.5 xl:grid-cols-3 xl:gap-5">
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
      </div>
    );
  } else if (error) {
    const problem = toProblem(error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    content = <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />;
  } else if (items.length === 0 && page > 1) {
    // The last card of a later page was removed: go back one page.
    content = (
      <EmptyState
        title={text.emptyTitle}
        action={{ label: text.previousPage, onClick: () => changePage(page - 1) }}
      />
    );
  } else if (items.length === 0) {
    content = (
      <EmptyState
        title={text.emptyTitle}
        description={text.emptyText}
        action={{ label: text.browse, to: '/properties' }}
      />
    );
  } else {
    content = (
      <>
        <ul className="grid items-start gap-3.5 xl:grid-cols-3 xl:gap-5">
          {items.map((property) => (
            <li key={property.id}>
              <PropertyCard property={property} />
            </li>
          ))}
        </ul>
        <Pagination page={data.pageNumber} totalPages={data.totalPages} onPageChange={changePage} />
      </>
    );
  }

  return (
    <>
      <PageTopBar title={text.title} backTo="/dashboard" />
      <AccountShell listingsCount={myProperties.data?.length}>
        <div className="flex flex-col gap-0.5">
          <h1 className="hidden text-[25px] leading-[1.72] font-bold text-text xl:block">
            {text.title}
          </h1>
          {data && data.totalCount > 0 && (
            <p className="text-[13.5px] leading-[1.72] text-text-secondary">
              {text.subtitle(formatNumber(data.totalCount))}
            </p>
          )}
        </div>
        {content}
      </AccountShell>
    </>
  );
}
