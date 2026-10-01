import { useParams, useSearchParams } from 'react-router';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { formatNumber } from '../../../lib/format.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { PropertyCard } from '../../properties/components/PropertyCard.jsx';
import { PropertyCardSkeleton } from '../../properties/components/PropertyCardSkeleton.jsx';
import { SEARCH_PAGE_SIZE } from '../../properties/constants.js';
import { useGetPropertiesQuery } from '../../properties/propertiesApi.js';
import { SellerHeader } from '../components/SellerHeader.jsx';
import { useGetSellerByIdQuery } from '../sellersApi.js';

const text = ar.sellers;

/** `?page=` as a whole number from 1. */
function readPage(searchParams) {
  const page = Math.floor(Number(searchParams.get('page')));
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

/** The search endpoint, limited to this seller: `?sellerId=…&page=…&pageSize=…`. */
function sellerListingsQuery(sellerId, page) {
  const params = new URLSearchParams({
    sellerId,
    page: String(page),
    pageSize: String(SEARCH_PAGE_SIZE),
  });
  return params.toString();
}

function loadErrorState(error, onRetry) {
  const problem = toProblem(error);
  let requestId;
  if (problem.status >= 500) requestId = problem.requestId;
  return <ErrorState message={problem.message} requestId={requestId} onRetry={onRetry} />;
}

/**
 * Figma "ملف البائع — زائر" (73:1373), public: the seller (photo, name, city, «عضو منذ», the
 * listings count, bio), then «عقاراته» as Property Cards three per row with pagination. Never
 * the email or the phone. The stats box (reply time, reply rate, deals) and «التقييمات» have no
 * API and are left out, so the tabs row keeps only «عقاراته».
 */
export default function SellerPage() {
  const { sellerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  const seller = useGetSellerByIdQuery(sellerId);
  const listings = useGetPropertiesQuery(sellerListingsQuery(sellerId, page), {
    skip: !seller.data,
  });

  function changePage(nextPage) {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set('page', String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 0 });
  }

  if (seller.isLoading) {
    return (
      <div className="flex items-center gap-4 bg-bg px-4 py-5 xl:gap-[22px] xl:px-[100px] xl:pt-[34px] xl:pb-[30px]">
        <Skeleton className="size-[68px] rounded-full xl:size-[92px]" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-5 w-72" />
        </div>
      </div>
    );
  }

  if (seller.error) {
    // 404 Seller.NotFound: no such seller (or the account is gone).
    if (toProblem(seller.error).status === 404) {
      return (
        <div className="p-4 xl:px-20 xl:py-[60px]">
          <EmptyState
            title={text.notFoundTitle}
            description={text.notFoundText}
            action={{ label: text.backToSearch, to: '/properties' }}
          />
        </div>
      );
    }
    return (
      <div className="p-4 xl:px-20 xl:py-[60px]">
        {loadErrorState(seller.error, seller.refetch)}
      </div>
    );
  }

  if (!seller.data) return null;

  let tabLabel = text.listingsTitle;
  if (listings.data) tabLabel = text.listingsTab(formatNumber(listings.data.totalCount));

  let content;
  if (listings.isLoading) {
    content = (
      <div className="grid gap-3.5 xl:grid-cols-3 xl:gap-5">
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
      </div>
    );
  } else if (listings.error) {
    content = loadErrorState(listings.error, listings.refetch);
  } else if (listings.data.items.length === 0 && page > 1) {
    content = (
      <EmptyState
        title={text.noListingsTitle}
        action={{ label: text.previousPage, onClick: () => changePage(page - 1) }}
      />
    );
  } else if (listings.data.items.length === 0) {
    content = <EmptyState title={text.noListingsTitle} description={text.noListingsText} />;
  } else {
    content = (
      <>
        <ul className="grid items-start gap-3.5 xl:grid-cols-3 xl:gap-5">
          {listings.data.items.map((property) => (
            <li key={property.id}>
              <PropertyCard property={property} />
            </li>
          ))}
        </ul>
        <Pagination
          page={listings.data.pageNumber}
          totalPages={listings.data.totalPages}
          onPageChange={changePage}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-surface">
      <SellerHeader seller={seller.data} />

      {/* Figma «تبويبات» (73:1485): the active «تبويب / Tab» — 18 sides, 12 top, 15 semibold
          brand/text over a 3px brand line; then the 1px line under the row. */}
      <div className="flex border-b border-border bg-bg px-4 xl:px-[100px]">
        <h2 className="flex flex-col items-center gap-2.5 px-[18px] pt-3 text-[15px] leading-[1.65] font-semibold text-brand-text">
          {tabLabel}
          <span aria-hidden="true" className="h-[3px] w-full rounded-[3px] bg-brand" />
        </h2>
      </div>

      <section className="flex flex-col gap-5 px-4 pt-4 pb-5 xl:px-[100px] xl:pt-7 xl:pb-[60px]">
        {content}
      </section>
    </div>
  );
}
