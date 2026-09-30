import { Link } from 'react-router';
import {
  IconTypeApartment,
  IconTypeLand,
  IconTypeShop,
  IconTypeVilla,
} from '../../../components/icons/index.js';
import { PROPERTY_TYPE_PLURALS } from '../constants.js';
import { searchPath } from '../searchFilters.js';

// The API's six types, in the Figma order (RTL). Figma has icons for أراضي، شقق، فلل and محلات
// (50:615, 50:609, 50:603, 50:597); مخازن reuses محلات and عمارات reuses شقق (not in Figma).
const categories = [
  { type: 'Land', Icon: IconTypeLand },
  { type: 'Apartment', Icon: IconTypeApartment },
  { type: 'House', Icon: IconTypeVilla },
  { type: 'Office', Icon: IconTypeShop },
  { type: 'Storage', Icon: IconTypeShop },
  { type: 'Building', Icon: IconTypeApartment },
];

/**
 * Desktop: Figma "التصنيفات" (50:587) cards. Mobile: the chips row "تصنيفات" (83:536).
 * Each opens the search filtered by that type. The offer counts are not in the API.
 */
export function HomeCategories() {
  return (
    <>
      <section className="hidden bg-bg px-[120px] pt-14 pb-11 xl:block">
        <ul className="flex gap-[18px]">
          {categories.map(({ type, Icon }) => (
            <li key={type} className="flex-1">
              <Link
                to={searchPath({ propertyType: [type] })}
                className="flex flex-col items-start gap-3 rounded-lg border border-border bg-surface px-[21px] pt-[23px] pb-[21px] transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span className="rounded-full bg-brand-subtle p-[11px] text-brand-text">
                  <Icon />
                </span>
                <span className="text-[16px] leading-[1.7] font-bold text-text">
                  {PROPERTY_TYPE_PLURALS[type]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 xl:hidden">
        {categories.map(({ type }) => (
          <li key={type} className="shrink-0">
            <Link
              to={searchPath({ propertyType: [type] })}
              className="block rounded-full border border-border bg-surface px-[15px] py-2 text-[13px] leading-[1.72] font-semibold text-text-secondary focus-visible:outline-2 focus-visible:outline-brand"
            >
              {PROPERTY_TYPE_PLURALS[type]}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
