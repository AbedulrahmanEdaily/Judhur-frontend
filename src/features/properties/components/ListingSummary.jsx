import { formatArea, formatPrice } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import {
  LAND_CLASSIFICATION_LABELS,
  LEGAL_STATUS_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from '../constants.js';

const text = ar.listing;
const rows = text.summaryRows;

/**
 * Figma "ملخّص العرض قبل الإرسال" (94:2512): label (14, text/secondary) at the start and the
 * value (15 semibold) at the end, 13px row padding, border/subtle lines between the rows.
 * Built from the saved listing, so it shows what the admin will review. The owner page reuses
 * it with its own heading.
 *
 * @param {{
 *   property: import('../../../api/types.js').MyPropertyDetails,
 *   title?: string,
 *   subtitle?: string,
 * }} props
 */
export function ListingSummary({
  property,
  title = text.summaryTitle,
  subtitle = text.summarySubtitle,
}) {
  let location = property.city;
  if (property.region) location = `${property.city} — ${property.region}`;

  let media = text.summaryImages(property.images.length);
  if (property.hasOwnershipDocument) {
    media = `${media} · ${text.summaryDocument(LEGAL_STATUS_LABELS[property.legalStatus])}`;
  } else {
    media = `${media} · ${text.summaryNoDocument}`;
  }

  return (
    <section className="flex flex-col xl:rounded-lg xl:border xl:border-border xl:bg-raised xl:px-[25px] xl:py-[23px]">
      <div className="flex flex-col gap-[3px]">
        <h2 className="text-[18px] leading-[1.55] font-semibold text-text xl:text-[20px]">
          {title}
        </h2>
        {subtitle && <p className="text-[13px] leading-[1.75] text-text-secondary">{subtitle}</p>}
      </div>
      <dl className="divide-y divide-border">
        <div className="flex items-start gap-4 py-[13px]">
          <dt className="shrink-0 text-[14px] leading-[1.75] text-text-secondary">{rows.title}</dt>
          <dd className="flex-1 text-end text-[15px] leading-[1.75] font-semibold text-text">
            {property.title}
          </dd>
        </div>
        <div className="flex items-start gap-4 py-[13px]">
          <dt className="shrink-0 text-[14px] leading-[1.75] text-text-secondary">
            {rows.purposeType}
          </dt>
          <dd className="flex-1 text-end text-[15px] leading-[1.75] font-semibold text-text">
            {PROPERTY_STATUS_LABELS[property.propertyStatus]} ·{' '}
            {PROPERTY_TYPE_LABELS[property.propertyType]}
          </dd>
        </div>
        <div className="flex items-start gap-4 py-[13px]">
          <dt className="shrink-0 text-[14px] leading-[1.75] text-text-secondary">
            {rows.areaPrice}
          </dt>
          <dd className="flex-1 text-end text-[15px] leading-[1.75] font-semibold text-text">
            {formatArea(property.area)} · <span dir="ltr">{formatPrice(property.price)}</span>
          </dd>
        </div>
        <div className="flex items-start gap-4 py-[13px]">
          <dt className="shrink-0 text-[14px] leading-[1.75] text-text-secondary">
            {rows.location}
          </dt>
          <dd className="flex-1 text-end text-[15px] leading-[1.75] font-semibold text-text">
            {location}
          </dd>
        </div>
        <div className="flex items-start gap-4 py-[13px]">
          <dt className="shrink-0 text-[14px] leading-[1.75] text-text-secondary">{rows.legal}</dt>
          <dd className="flex-1 text-end text-[15px] leading-[1.75] font-semibold text-text">
            {LAND_CLASSIFICATION_LABELS[property.landClassification]} ·{' '}
            {LEGAL_STATUS_LABELS[property.legalStatus]}
          </dd>
        </div>
        <div className="flex items-start gap-4 py-[13px]">
          <dt className="shrink-0 text-[14px] leading-[1.75] text-text-secondary">{rows.media}</dt>
          <dd className="flex-1 text-end text-[15px] leading-[1.75] font-semibold text-text">
            {media}
          </dd>
        </div>
      </dl>
    </section>
  );
}
