import { Fragment } from 'react';
import { IconFactArea, IconFactDocument } from '../../../components/icons/index.js';
import { formatArea } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { LEGAL_STATUS_LABELS } from '../constants.js';

/**
 * Figma key facts card (66:1161): items split by 40px dividers, each a brand/subtle icon circle
 * then label 12 muted over value 16 bold. Only area and document come from the API; the
 * street and frontage facts of the frame are not in it.
 *
 * @param {{ property: import('../../../api/types.js').PropertyDetails }} props
 */
export function KeyFacts({ property }) {
  const facts = [
    { label: ar.property.area, value: formatArea(property.area), Icon: IconFactArea },
    {
      label: ar.property.document,
      value: LEGAL_STATUS_LABELS[property.legalStatus],
      Icon: IconFactDocument,
    },
  ];

  return (
    <div className="flex items-center rounded-lg border border-border bg-raised p-[23px]">
      {facts.map(({ label, value, Icon }, index) => (
        <Fragment key={label}>
          {index > 0 && <div className="h-10 w-px shrink-0 bg-border" />}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="shrink-0 rounded-full bg-brand-subtle p-[9px] text-brand-text">
              <Icon />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-px leading-[1.78]">
              <span className="text-[12px] text-muted">{label}</span>
              <span className="text-[16px] font-bold text-text">{value}</span>
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
