import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { ActiveFilterChips } from '../components/ActiveFilterChips.jsx';
import { FiltersDrawer } from '../components/FiltersDrawer.jsx';
import { PropertyCard } from '../components/PropertyCard.jsx';
import { PropertyCardSkeleton } from '../components/PropertyCardSkeleton.jsx';
import { SearchFiltersPanel } from '../components/SearchFiltersPanel.jsx';
import { SearchHeader } from '../components/SearchHeader.jsx';
import { SearchToolbar } from '../components/SearchToolbar.jsx';
import { SortMenu } from '../components/SortMenu.jsx';
import { useGetPropertiesQuery } from '../propertiesApi.js';
import { EMPTY_FILTERS, readSearchFilters, toApiQuery, toSearchParams } from '../searchFilters.js';

const text = ar.search;

// The only search error with its own message (more than 20 cities); shown as the server sends it.
const TOO_MANY_CITIES = 'PropertyErrors.TooManyCitiesInFilter';

/**
 * Figma "نتائج البحث — زائر" (52:782) from 1280px up and "نتائج البحث — موبايل" (83:599) below.
 * Filters, sort and page live in the URL, so a search can be shared and survives a refresh.
 */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const filters = readSearchFilters(searchParams);
  const { data, isFetching, error, refetch } = useGetPropertiesQuery(toApiQuery(filters));

  function applyFilters(nextFilters) {
    setSearchParams(toSearchParams(nextFilters));
    setIsDrawerOpen(false);
  }

  /** `value` is set for the list filters: only that value is removed from the list. */
  function removeFilter(key, value) {
    const next = { ...filters, page: 1 };
    if (key === 'price') {
      next.minPrice = null;
      next.maxPrice = null;
    } else if (value) {
      next[key] = filters[key].filter((item) => item !== value);
    } else {
      next[key] = EMPTY_FILTERS[key];
    }
    applyFilters(next);
  }

  function changePage(page) {
    applyFilters({ ...filters, page });
    window.scrollTo({ top: 0 });
  }

  let results;
  if (isFetching) {
    results = (
      <div className="grid gap-3.5 xl:grid-cols-3 xl:gap-5">
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
      </div>
    );
  } else if (error) {
    const problem = toProblem(error);
    let message = problem.message;
    if (problem.errorCodes[TOO_MANY_CITIES]) message = problem.errorCodes[TOO_MANY_CITIES];
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    results = <ErrorState message={message} requestId={requestId} onRetry={refetch} />;
  } else if (
    data &&
    data.items.length === 0 &&
    filters.page > data.totalPages &&
    data.totalPages > 0
  ) {
    // An old link or fewer results than before: this page is past the last one.
    results = (
      <EmptyState
        title={text.pageGoneTitle}
        description={text.pageGoneText}
        action={{ label: text.lastPage, onClick: () => changePage(data.totalPages) }}
      />
    );
  } else if (!data || data.items.length === 0) {
    results = (
      <EmptyState
        title={text.emptyTitle}
        description={text.emptyText}
        action={{ label: text.clearAll, onClick: () => applyFilters(EMPTY_FILTERS) }}
      />
    );
  } else {
    results = (
      <>
        <ul className="grid items-start gap-3.5 xl:grid-cols-3 xl:gap-5">
          {data.items.map((property) => (
            <li key={property.id}>
              <PropertyCard property={property} />
            </li>
          ))}
        </ul>
        <Pagination
          page={data.pageNumber}
          totalPages={data.totalPages}
          onPageChange={changePage}
          className="pt-4"
        />
      </>
    );
  }

  return (
    <div className="min-h-full bg-surface">
      <SearchHeader
        filters={filters}
        totalCount={data?.totalCount}
        onOpenFilters={() => setIsDrawerOpen(true)}
      />

      <div className="flex items-start gap-[26px] px-4 pt-3.5 pb-5 xl:px-20 xl:pt-[26px] xl:pb-[60px]">
        <aside className="hidden w-[312px] shrink-0 xl:block">
          <SearchFiltersPanel filters={filters} onApply={applyFilters} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-3.5 xl:gap-5">
          <div className="hidden flex-col gap-5 xl:flex">
            <SearchToolbar
              totalCount={data?.totalCount}
              sort={filters.sort}
              onSortChange={(sort) => applyFilters({ ...filters, sort, page: 1 })}
            />
            <ActiveFilterChips filters={filters} onRemove={removeFilter} />
          </div>
          {results}
        </div>
      </div>

      <FiltersDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {/* The sort of the desktop toolbar (not in the mobile Figma frame). */}
        <div className="flex justify-end pb-3">
          <SortMenu
            value={filters.sort}
            onChange={(sort) => applyFilters({ ...filters, sort, page: 1 })}
          />
        </div>
        <SearchFiltersPanel filters={filters} onApply={applyFilters} />
      </FiltersDrawer>
    </div>
  );
}
