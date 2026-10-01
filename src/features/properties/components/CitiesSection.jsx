import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { IconBackChevron } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import hebronPhoto from '../../../assets/photos/cities/hebron.jpg';
import jerusalemPhoto from '../../../assets/photos/cities/jerusalem.jpg';
import nablusPhoto from '../../../assets/photos/cities/nablus.jpg';
import qalqilyaPhoto from '../../../assets/photos/cities/qalqilya.jpg';
import tubasPhoto from '../../../assets/photos/cities/tubas.jpg';
import { CITIES } from '../constants.js';
import { searchPath } from '../searchFilters.js';
import { PropertyPhoto } from './PropertyPhoto.jsx';

// A real photo of the city where we have one (supplied by the owner, not in Figma).
const cityPhotos = {
  نابلس: nablusPhoto,
  الخليل: hebronPhoto,
  القدس: jerusalemPhoto,
  قلقيلية: qalqilyaPhoto,
  طوباس: tubasPhoto,
};

// The Figma illustration order (51:760), repeated for the cities without a photo yet.
const placeholders = ['morning', 'noon', 'sunset', 'noon', 'morning'];
const cities = CITIES.map((name, index) => ({
  name,
  photo: cityPhotos[name],
  placeholder: placeholders[index % placeholders.length],
}));

const arrowClasses =
  'flex size-10 items-center justify-center rounded-full border border-border bg-surface text-text transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default disabled:opacity-40 disabled:hover:bg-surface';

/**
 * Figma "المدن" (51:756). Five cards fit the width as in Figma; the rest of CITIES scroll
 * sideways with the arrow buttons (not in Figma) or a swipe. Each card opens the search for
 * that city. The listing counts are not in the API. Desktop only, as in Figma. A city with a
 * real photo gets it under a lighter, bottom-heavy overlay so the place shows; the others keep
 * the Figma illustration and overlay.
 */
export function CitiesSection() {
  const listRef = useRef(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // In RTL scrollLeft is 0 at the start and goes negative towards the end.
  function handleScroll() {
    const list = listRef.current;
    const scrolled = Math.abs(list.scrollLeft);
    setIsAtStart(scrolled < 1);
    setIsAtEnd(scrolled + list.clientWidth >= list.scrollWidth - 1);
  }

  // One page of cards per click: towards the end is left in RTL.
  function scrollByPage(towardsEnd) {
    const list = listRef.current;
    let distance = list.clientWidth;
    if (towardsEnd) distance = -distance;
    list.scrollBy({ left: distance, behavior: 'smooth' });
  }

  return (
    <section className="hidden flex-col gap-6 bg-bg px-[120px] pt-[60px] pb-14 xl:flex">
      <div className="flex items-center gap-4">
        <h2 className="flex-1 text-[26px] leading-[1.72] font-bold text-text">
          {ar.home.citiesTitle}
        </h2>
        <button
          type="button"
          onClick={() => scrollByPage(false)}
          disabled={isAtStart}
          aria-label={ar.home.citiesPrevious}
          className={arrowClasses}
        >
          <IconBackChevron />
        </button>
        <button
          type="button"
          onClick={() => scrollByPage(true)}
          disabled={isAtEnd}
          aria-label={ar.home.citiesNext}
          className={arrowClasses}
        >
          <IconBackChevron className="rotate-180" />
        </button>
      </div>
      <ul
        ref={listRef}
        onScroll={handleScroll}
        className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto"
      >
        {cities.map((city) => (
          <li key={city.name} className="w-[calc((100%-64px)/5)] shrink-0 snap-start">
            <Link
              to={searchPath({ city: [city.name] })}
              className="relative flex h-[136px] flex-col justify-end overflow-hidden rounded-lg px-[18px] pb-[18px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
            >
              {city.photo && (
                <>
                  <img
                    src={city.photo}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <span className="absolute inset-0 bg-city-photo-overlay" />
                </>
              )}
              {!city.photo && (
                <>
                  <PropertyPhoto placeholder={city.placeholder} className="absolute inset-0" />
                  <span className="absolute inset-0 bg-city-overlay" />
                </>
              )}
              <span className="relative text-[18px] leading-[1.75] font-bold text-white">
                {city.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
