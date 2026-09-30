import clsx from 'clsx';
import { IconInfo, IconLegalCheck, IconLegalCheckSmall } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import { LEGAL_STATUS_LABELS } from '../constants.js';

const text = ar.property;

const softClasses = { A: 'bg-land-a-soft', B: 'bg-land-b-soft', C: 'bg-land-c-soft' };
const solidClasses = { A: 'bg-land-a', B: 'bg-land-b', C: 'bg-land-c' };
const textClasses = { A: 'text-land-a', B: 'text-land-b', C: 'text-land-c' };

/**
 * Desktop: Figma "الوضع القانوني للأرض" (66:1197) — the land-class box and the document note.
 * Mobile: the compact box "قانوني" of 83:709. Figma shows class (أ) only; (ب) and (ج) use the
 * same layout with their land/* colors and the check icon (their wording is not in Figma).
 *
 * @param {{
 *   landClassification: import('../../../api/types.js').LandClassification,
 *   legalStatus: import('../../../api/types.js').LegalStatus,
 * }} props
 */
export function LegalStatusCard({ landClassification, legalStatus }) {
  return (
    <>
      <section className="hidden flex-col gap-4 rounded-lg border border-border bg-raised p-[23px] xl:flex">
        <h2 className="text-[19px] leading-[1.78] font-bold text-text">{text.legalTitle}</h2>
        <div
          className={clsx(
            'flex items-start gap-3.5 rounded-lg p-[18px]',
            softClasses[landClassification],
          )}
        >
          <span
            className={clsx(
              'shrink-0 rounded-full p-2 text-inverse',
              solidClasses[landClassification],
            )}
          >
            <IconLegalCheck />
          </span>
          <div className="flex flex-col gap-1 leading-[1.78]">
            <p className={clsx('text-[16px] font-bold', textClasses[landClassification])}>
              {text.landTitles[landClassification]}
            </p>
            <p className="text-[13.5px] text-text-secondary">
              {text.landTexts[landClassification]}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-md bg-inset px-4 py-3.5">
          <IconInfo className="shrink-0 text-muted" />
          <p className="text-[12.5px] leading-[1.78] text-text-secondary">
            {text.documentNote(LEGAL_STATUS_LABELS[legalStatus])}
          </p>
        </div>
      </section>

      <div
        className={clsx(
          'flex items-start gap-2.5 rounded-lg p-3.5 xl:hidden',
          softClasses[landClassification],
        )}
      >
        <span
          className={clsx(
            'shrink-0 rounded-full p-1.5 text-inverse',
            solidClasses[landClassification],
          )}
        >
          <IconLegalCheckSmall />
        </span>
        <div className="flex flex-col gap-0.5 leading-[1.72]">
          <p className={clsx('text-[14px] font-bold', textClasses[landClassification])}>
            {text.landTitles[landClassification]}
          </p>
          <p className="text-[12px] text-text-secondary">
            {text.landMobileTexts[landClassification]}
          </p>
        </div>
      </div>
    </>
  );
}
