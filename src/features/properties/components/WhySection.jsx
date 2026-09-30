import {
  IconWhyClassification,
  IconWhyDocument,
  IconWhyPhotos,
} from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';

const text = ar.home;

// Right to left as in Figma (51:776).
const reasons = [
  {
    Icon: IconWhyClassification,
    title: text.whyClassificationTitle,
    body: text.whyClassificationText,
  },
  { Icon: IconWhyDocument, title: text.whyDocumentTitle, body: text.whyDocumentText },
  { Icon: IconWhyPhotos, title: text.whyPhotosTitle, body: text.whyPhotosText },
];

/** Figma "لماذا جذور" (51:776): three static points on bg/surface. Desktop only, as in Figma. */
export function WhySection() {
  return (
    <section className="hidden gap-5 bg-surface px-[120px] py-10 xl:flex">
      {reasons.map(({ Icon, title, body }) => (
        <div key={title} className="flex flex-1 items-start gap-3.5">
          <span className="shrink-0 rounded-full bg-brand-subtle p-2.5 text-brand-text">
            <Icon />
          </span>
          <div className="flex flex-col gap-1 leading-[1.72]">
            <h3 className="text-[16px] font-bold text-text">{title}</h3>
            <p className="text-[13px] text-text-secondary">{body}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
