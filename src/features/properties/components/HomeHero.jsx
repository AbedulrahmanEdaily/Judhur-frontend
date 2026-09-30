import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { IconHeroSearch, IconMobileSearch } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import {
  CITIES,
  HERO_PRICE_RANGES,
  LISTING_STATUSES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
} from '../constants.js';
import { formatPriceRange, searchPath } from '../searchFilters.js';
import { HeroSearchField } from './HeroSearchField.jsx';
import { PropertyPhoto } from './PropertyPhoto.jsx';

const text = ar.home;

const purposeOptions = LISTING_STATUSES.map((status) => ({
  value: status,
  label: PROPERTY_STATUS_LABELS[status],
}));
const cityOptions = [
  { value: '', label: text.allCities },
  ...CITIES.map((city) => ({ value: city, label: city })),
];
const typeOptions = [
  { value: '', label: text.anyType },
  ...PROPERTY_TYPES.map((type) => ({ value: type, label: PROPERTY_TYPE_LABELS[type] })),
];
const priceOptions = [
  { value: '', label: text.anyPrice },
  ...HERO_PRICE_RANGES.map((range, index) => ({
    value: String(index),
    label: formatPriceRange(range.minPrice, range.maxPrice),
  })),
];

/**
 * Desktop: Figma "الواجهة" (49:589) — the Property Photo under the "طبقة تعتيم" gradient, the
 * tagline pill, title, subtitle, and the four-field search bar.
 * Mobile: Figma "واجهة" (83:529) — a gradient card with a single text search.
 */
export function HomeHero() {
  const navigate = useNavigate();
  const searchInputId = useId();
  const [purpose, setPurpose] = useState('ForSale');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  function handleSearch(event) {
    event.preventDefault();
    let range = { minPrice: null, maxPrice: null };
    if (priceRange !== '') range = HERO_PRICE_RANGES[Number(priceRange)];
    navigate(
      searchPath({
        propertyStatus: purpose,
        city,
        propertyType,
        minPrice: range.minPrice,
        maxPrice: range.maxPrice,
      }),
    );
  }

  function handleMobileSearch(event) {
    event.preventDefault();
    navigate(searchPath({ searchTerm: searchTerm.trim() }));
  }

  return (
    <>
      <section className="relative hidden flex-col items-center justify-center gap-[26px] overflow-hidden px-[120px] py-[72px] xl:flex">
        <PropertyPhoto className="absolute inset-0" />
        <div className="absolute inset-0 bg-home-hero-overlay" />

        <p className="relative rounded-full bg-white/14 px-4 py-[7px] text-[13px] leading-[1.55] font-semibold text-white">
          {text.tagline}
        </p>
        <h1 className="relative w-[900px] text-center text-[46px] leading-[1.5] font-bold text-white">
          {text.title}
        </h1>
        <p className="relative w-[740px] text-center text-[16px] leading-[1.8] text-white/82">
          {text.subtitle}
        </p>

        <form
          role="search"
          onSubmit={handleSearch}
          className="relative flex h-[76px] w-[960px] items-center rounded-[18px] bg-raised p-2 shadow-search"
        >
          <HeroSearchField
            label={text.purpose}
            value={purpose}
            onChange={setPurpose}
            options={purposeOptions}
          />
          <div className="h-9 w-px shrink-0 bg-border" />
          <HeroSearchField
            label={text.city}
            value={city}
            onChange={setCity}
            options={cityOptions}
          />
          <div className="h-9 w-px shrink-0 bg-border" />
          <HeroSearchField
            label={text.propertyType}
            value={propertyType}
            onChange={setPropertyType}
            options={typeOptions}
          />
          <div className="h-9 w-px shrink-0 bg-border" />
          <HeroSearchField
            label={text.price}
            value={priceRange}
            onChange={setPriceRange}
            options={priceOptions}
          />
          <button
            type="submit"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-brand px-[30px] py-4 text-[15.5px] leading-[1.68] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <IconHeroSearch />
            {text.search}
          </button>
        </form>

        <p className="relative text-center text-[13px] leading-[1.55] text-white/70">{text.hint}</p>
      </section>

      <section className="flex flex-col gap-3 rounded-lg bg-home-hero-mobile px-[18px] py-[22px] xl:hidden">
        <h1 className="text-[21px] leading-[1.65] font-bold text-white">{text.mobileTitle}</h1>
        <p className="text-[12.5px] leading-[1.65] text-white/75">{text.mobileSubtitle}</p>
        <form
          role="search"
          onSubmit={handleMobileSearch}
          className="flex items-center gap-2.5 rounded-lg bg-raised px-3.5 py-[13px] text-muted focus-within:ring-2 focus-within:ring-brand"
        >
          <label htmlFor={searchInputId} className="sr-only">
            {ar.nav.searchLabel}
          </label>
          <IconMobileSearch className="shrink-0" />
          <input
            id={searchInputId}
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={ar.nav.searchPlaceholder}
            className="w-full min-w-0 bg-transparent text-[13.5px] leading-[1.72] text-text outline-none placeholder:text-muted"
          />
        </form>
      </section>
    </>
  );
}
