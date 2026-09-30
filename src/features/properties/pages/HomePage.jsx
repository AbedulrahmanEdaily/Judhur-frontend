import { AiSection } from '../components/AiSection.jsx';
import { CitiesSection } from '../components/CitiesSection.jsx';
import { FeaturedProperties } from '../components/FeaturedProperties.jsx';
import { HomeCategories } from '../components/HomeCategories.jsx';
import { HomeHero } from '../components/HomeHero.jsx';
import { WhySection } from '../components/WhySection.jsx';
import { useGetPropertiesQuery } from '../propertiesApi.js';

// Figma shows one row of four cards.
const FEATURED_QUERY = 'pageSize=4';

/**
 * Figma "الرئيسية — زائر" (49:472) from 1280px up, "الرئيسية — موبايل" (83:472) below it.
 * Desktop sections are full width; on mobile they sit in one padded column (16 / 18 gap).
 */
export default function HomePage() {
  const { data, isLoading, error, refetch } = useGetPropertiesQuery(FEATURED_QUERY);

  return (
    <div className="flex flex-col gap-[18px] px-4 pt-4 pb-5 xl:gap-0 xl:p-0">
      <HomeHero />
      <HomeCategories />
      <FeaturedProperties
        properties={data?.items}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
      <AiSection />
      <CitiesSection />
      <WhySection />
    </div>
  );
}
