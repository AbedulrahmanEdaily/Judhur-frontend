import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
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
import { SellerReviewsTab } from '../../reviews/components/SellerReviewsTab.jsx';
import { SellerHeader } from '../components/SellerHeader.jsx';
import { SellerTab } from '../components/SellerTab.jsx';
import { useGetSellerByIdQuery } from '../sellersApi.js';

const text = ar.sellers;
const REVIEWS_HASH = '#reviews';

/** `?page=` (listings) or `?reviewsPage=` as a whole number from 1. */
function readPage(searchParams, name) {
  const page = Math.floor(Number(searchParams.get(name)));
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
 * Figma "ملف البائع — زائر" (73:1373), public: the seller (photo, name, rating, city, «عضو منذ»,
 * bio), then two tabs: «عقاراته» — Property Cards three per row with pagination (`?page=`) — and
 * «التقييمات» (`#reviews`, `?reviewsPage=`): my review and the reviews. Figma lists the latest
 * reviews under the listings too; here they are only in their tab, paginated, so a link to
 * `#reviews` (the details seller box, the new-review notification) opens them directly. Never
 * the email or the phone. The stats box (reply time, reply rate, deals) has no API.
 */
export default function SellerPage() {
  const { sellerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReviewsTab = location.hash === REVIEWS_HASH;
  const page = readPage(searchParams, 'page');
  const reviewsPage = readPage(searchParams, 'reviewsPage');
  const seller = useGetSellerByIdQuery(sellerId);
  const listings = useGetPropertiesQuery(sellerListingsQuery(sellerId, page), {
    skip: !seller.data || isReviewsTab,
  });

  /** One of the two page numbers in the URL changes; the other and the tab stay. */
  function changePage(name, nextPage) {
    const params = new URLSearchParams(searchParams);
    params.delete(name);
    if (nextPage > 1) params.set(name, String(nextPage));
    navigate({ search: params.toString(), hash: location.hash });
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

  let content;
  if (isReviewsTab) {
    content = (
      <SellerReviewsTab
        sellerId={sellerId}
        page={reviewsPage}
        onPageChange={(nextPage) => changePage('reviewsPage', nextPage)}
      />
    );
  } else if (listings.isLoading) {
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
        action={{ label: text.previousPage, onClick: () => changePage('page', page - 1) }}
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
          onPageChange={(nextPage) => changePage('page', nextPage)}
        />
      </>
    );
  }

  const listingsTabLabel = text.listingsTab(formatNumber(seller.data.activeListingsCount));
  const reviewsTabLabel = ar.reviews.tab(formatNumber(seller.data.reviewsCount));
  let openTabLabel = listingsTabLabel;
  if (isReviewsTab) openTabLabel = reviewsTabLabel;

  return (
    <div className="flex min-h-full flex-col bg-surface">
      <SellerHeader seller={seller.data} />

      {/* Figma «تبويبات» (73:1485): «عقاراته» then «التقييمات», 6 apart, on bg/canvas; then the
          1px line under the row. */}
      <nav
        aria-label={text.tabsLabel}
        className="flex gap-1.5 border-b border-border bg-bg px-4 xl:px-[100px]"
      >
        <SellerTab to={{ search: location.search, hash: '' }} isActive={!isReviewsTab}>
          {listingsTabLabel}
        </SellerTab>
        <SellerTab to={{ search: location.search, hash: REVIEWS_HASH }} isActive={isReviewsTab}>
          {reviewsTabLabel}
        </SellerTab>
      </nav>

      <section className="flex flex-col gap-5 px-4 pt-4 pb-5 xl:px-[100px] xl:pt-7 xl:pb-[60px]">
        {/* Keeps the heading order (h1 → h2 → the cards' h3) for screen readers. */}
        <h2 className="sr-only">{openTabLabel}</h2>
        {content}
      </section>
    </div>
  );
}
