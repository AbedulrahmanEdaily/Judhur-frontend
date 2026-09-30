import { ar } from '../../../locales/ar.js';

/**
 * Figma "وصف العقار" (66:1212): title 19 bold, then the seller's text 14.5/1.78 keeping its
 * line breaks.
 *
 * @param {{ description: string }} props
 */
export function DescriptionCard({ description }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-raised p-[23px]">
      <h2 className="text-[19px] leading-[1.78] font-bold text-text">{ar.property.description}</h2>
      <p className="text-[14.5px] leading-[1.78] whitespace-pre-line text-text-secondary">
        {description}
      </p>
    </section>
  );
}
