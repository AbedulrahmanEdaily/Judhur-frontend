import { IconMapPin } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';

/**
 * Figma "الموقع على الخريطة" (67:1177): the 300px map area (bg/inset, radius 14) with the brand
 * pin and the place name. The HERE map is not installed yet, so this is the static card
 * CLAUDE.md asks for when the map can't load. The "nearby" row is not in the API.
 *
 * @param {{ place: string }} props
 */
export function LocationCard({ place }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-raised p-[23px]">
      <h2 className="text-[19px] leading-[1.78] font-bold text-text">{ar.property.mapTitle}</h2>
      <div className="flex h-[300px] flex-col items-center justify-center gap-2 rounded-[14px] bg-inset">
        <span className="rounded-full bg-brand p-3 text-inverse">
          <IconMapPin />
        </span>
        <p className="text-center text-[13px] leading-[1.78] font-semibold text-text-secondary">
          {place}
        </p>
      </div>
    </section>
  );
}
