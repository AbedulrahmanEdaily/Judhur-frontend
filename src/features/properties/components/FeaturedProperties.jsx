import { Link } from 'react-router';
import { IconSeeAll } from '../../../components/icons/index.js';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { PropertyCard } from './PropertyCard.jsx';
import { PropertyCardSkeleton } from './PropertyCardSkeleton.jsx';

const text = ar.home;

/**
 * Figma "عقارات مميزة" (50:619): the newest approved listings, four in a row on desktop and
 * stacked cards on mobile (83:543). The API has no "featured" flag, so these are the latest.
 *
 * @param {{
 *   properties?: import('../../../api/types.js').PropertySummary[],
 *   isLoading: boolean,
 *   error?: unknown,
 *   onRetry: () => void,
 * }} props
 */
export function FeaturedProperties({ properties, isLoading, error, onRetry }) {
  let content;
  if (isLoading) {
    content = (
      <div className="flex flex-col gap-[18px] xl:grid xl:grid-cols-4 xl:items-start xl:gap-[22px]">
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
      </div>
    );
  } else if (error) {
    const problem = toProblem(error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    content = <ErrorState message={problem.message} requestId={requestId} onRetry={onRetry} />;
  } else if (!properties || properties.length === 0) {
    content = <EmptyState title={text.featuredEmpty} description={text.featuredEmptyHint} />;
  } else {
    content = (
      <ul className="flex flex-col gap-[18px] xl:grid xl:grid-cols-4 xl:items-start xl:gap-[22px]">
        {properties.map((property) => (
          <li key={property.id}>
            <PropertyCard property={property} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="flex flex-col gap-[18px] xl:gap-[26px] xl:bg-surface xl:px-[120px] xl:pt-14 xl:pb-[60px]">
      <div className="flex items-center gap-3">
        <h2 className="flex-1 text-[18px] leading-[1.72] font-bold text-text xl:text-[26px] xl:leading-[1.7]">
          {text.featured}
        </h2>
        <Link
          to="/properties"
          className="flex items-center gap-1.5 rounded-sm text-[12.5px] leading-[1.72] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand xl:text-[14px] xl:leading-[1.7]"
        >
          {text.seeAll}
          <IconSeeAll className="hidden xl:block" />
        </Link>
      </div>
      {content}
    </section>
  );
}
