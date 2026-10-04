import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { IconMapPin } from '../../../components/icons/index.js';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { MarkersMap } from '../../../lib/maps/MarkersMap.jsx';
import { hasMapKey } from '../../../lib/maps/platform.js';
import { formatNumber, formatPrice } from '../../../lib/format.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { FiltersDrawer } from '../../properties/components/FiltersDrawer.jsx';
import { SearchFiltersPanel } from '../../properties/components/SearchFiltersPanel.jsx';
import { SortMenu } from '../../properties/components/SortMenu.jsx';
import {
  useGetPropertiesQuery,
  useGetPropertyLocationsQuery,
} from '../../properties/propertiesApi.js';
import { readSearchFilters, toApiQuery, toSearchParams } from '../../properties/searchFilters.js';
import { MapFiltersBar } from '../components/MapFiltersBar.jsx';
import { MapListingRow } from '../components/MapListingRow.jsx';

const text = ar.map;
const NO_IDS = [];

/**
 * Figma "الخريطة — زائر" (71:1300): the filters bar, then the 430px list at the start and the
 * map with a price pin per listing. The same search as `/properties` (filters, sort and page in
 * the URL), 12 listings at a time. A pin and its row light up together: tapping a pin brings
 * its row into view, pointing at a row lights its pin. Below 1280px the map sits above the list
 * (no mobile frame in Figma). Without a HERE key the list still works.
 */
export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const filters = readSearchFilters(searchParams);
  const listings = useGetPropertiesQuery(toApiQuery(filters));

  let ids = NO_IDS;
  if (listings.data) ids = listings.data.items.map((property) => property.id);
  const locations = useGetPropertyLocationsQuery(ids, { skip: ids.length === 0 });

  const locationById = {};
  for (const location of locations.data ?? []) locationById[location.id] = location;

  const markers = [];
  for (const property of listings.data?.items ?? []) {
    const location = locationById[property.id];
    if (!location) continue;
    markers.push({
      id: property.id,
      lat: location.latitude,
      lng: location.longitude,
      label: formatPrice(property.price),
    });
  }

  function applyFilters(nextFilters) {
    setSearchParams(toSearchParams(nextFilters));
    setIsDrawerOpen(false);
    setActiveId(null);
  }

  function changePage(page) {
    applyFilters({ ...filters, page });
  }

  // A tapped pin: light its row and bring it into view in the list.
  function selectFromMap(id) {
    setActiveId(id);
    const row = document.querySelector(`[data-listing-id="${id}"]`);
    if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  let list;
  if (listings.isFetching) {
    list = (
      <div className="flex flex-col gap-px">
        <Skeleton className="h-[94px] rounded-none" />
        <Skeleton className="h-[94px] rounded-none" />
        <Skeleton className="h-[94px] rounded-none" />
      </div>
    );
  } else if (listings.error) {
    const problem = toProblem(listings.error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    list = (
      <div className="p-4">
        <ErrorState message={problem.message} requestId={requestId} onRetry={listings.refetch} />
      </div>
    );
  } else if (!listings.data || listings.data.items.length === 0) {
    list = (
      <div className="p-4">
        <EmptyState title={text.emptyTitle} description={text.emptyText} />
      </div>
    );
  } else {
    list = (
      <>
        <ul className="divide-y divide-border border-b border-border">
          {listings.data.items.map((property) => (
            <li key={property.id}>
              <MapListingRow
                property={property}
                landClassification={locationById[property.id]?.landClassification}
                isActive={property.id === activeId}
                onHover={setActiveId}
              />
            </li>
          ))}
        </ul>
        <Pagination
          page={listings.data.pageNumber}
          totalPages={listings.data.totalPages}
          onPageChange={changePage}
          className="px-4 py-4"
        />
      </>
    );
  }

  const unavailable = (
    <div className="flex size-full flex-col items-center justify-center gap-2 bg-inset px-6 text-center">
      <span className="rounded-full bg-brand p-3 text-inverse">
        <IconMapPin />
      </span>
      <p className="text-[13.5px] leading-[1.72] font-semibold text-text-secondary">
        {text.unavailable}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col bg-surface">
      <h1 className="sr-only">{text.title}</h1>
      <MapFiltersBar filters={filters} onOpenFilters={() => setIsDrawerOpen(true)} />

      <div className="flex flex-col xl:h-[calc(100dvh-140px)] xl:flex-row">
        {/* The list: at the start from 1280px up, under the map below it. */}
        <section className="order-last flex flex-col border-border bg-surface xl:order-none xl:w-[430px] xl:shrink-0 xl:border-e">
          <div className="flex items-center gap-3 border-b border-border bg-raised px-5 py-3">
            <p className="flex-1 text-[15px] leading-[1.7] font-bold text-text">
              {listings.data && text.count(formatNumber(listings.data.totalCount))}
            </p>
            <SortMenu
              value={filters.sort}
              onChange={(sort) => applyFilters({ ...filters, sort, page: 1 })}
            />
          </div>
          <div className="xl:min-h-0 xl:flex-1 xl:overflow-y-auto">{list}</div>
        </section>

        <div className="relative h-[55vh] bg-inset xl:h-auto xl:flex-1">
          {!hasMapKey() && unavailable}
          {hasMapKey() && (
            <MarkersMap
              markers={markers}
              activeId={activeId}
              onSelect={selectFromMap}
              label={text.mapLabel}
              zoomInLabel={text.zoomIn}
              zoomOutLabel={text.zoomOut}
              className="size-full"
              fallback={unavailable}
            />
          )}
          {locations.isFetching && (
            <p
              role="status"
              className="absolute start-1/2 top-4 -translate-x-1/2 rounded-full bg-raised px-4 py-1.5 text-[12.5px] leading-[1.7] font-semibold text-text-secondary shadow-marker rtl:translate-x-1/2"
            >
              {text.locating}
            </p>
          )}
        </div>
      </div>

      <FiltersDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <SearchFiltersPanel filters={filters} onApply={applyFilters} />
      </FiltersDrawer>
    </div>
  );
}
