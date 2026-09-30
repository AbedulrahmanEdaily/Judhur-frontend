import { Link } from 'react-router';
import { ar } from '../../../locales/ar.js';
import { CITIES } from '../constants.js';
import { searchPath } from '../searchFilters.js';
import { PropertyPhoto } from './PropertyPhoto.jsx';

// Right to left as in Figma (51:760): the first five of CITIES, each with its Property Photo
// variant.
const cityPhotos = ['morning', 'noon', 'sunset', 'noon', 'morning'];
const cities = cityPhotos.map((photo, index) => ({ name: CITIES[index], photo }));

/**
 * Figma "المدن" (51:756). Each card opens the search for that city. The listing counts are not
 * in the API, so the card keeps its height without them. Desktop only, as in Figma.
 */
export function CitiesSection() {
  return (
    <section className="hidden flex-col gap-6 bg-bg px-[120px] pt-[60px] pb-14 xl:flex">
      <h2 className="text-[26px] leading-[1.72] font-bold text-text">{ar.home.citiesTitle}</h2>
      <ul className="flex gap-4">
        {cities.map((city) => (
          <li key={city.name} className="flex-1">
            <Link
              to={searchPath({ city: city.name })}
              className="relative flex h-[136px] flex-col justify-end overflow-hidden rounded-lg px-[18px] pb-[18px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <PropertyPhoto placeholder={city.photo} className="absolute inset-0" />
              <span className="absolute inset-0 bg-city-overlay" />
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
