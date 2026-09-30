import { IconNextArrow } from '../../../components/icons/index.js';
import { Spinner } from '../../../components/ui/Spinner.jsx';
import { ar } from '../../../locales/ar.js';

const text = ar.listing;

/**
 * Figma "تنقّل" (77:1309), right to left: «الخطوة n من 4», then at the far end «احفظ كمسودة»
 * (bg/raised, 1px border/strong, 22×14) and the brand «التالي: …» button (28×14, 15/1.72, the
 * 17px arrow).
 * Mobile (84:713): one full-width button in a bar fixed to the bottom.
 * The primary button submits the wizard form (by id, as the media steps sit outside it).
 *
 * @param {{
 *   formId: string,
 *   step: number,
 *   primaryLabel: string,
 *   isBusy: boolean,
 *   onSaveDraft?: () => void,
 * }} props
 */
export function WizardActions({ formId, step, primaryLabel, isBusy, onSaveDraft }) {
  return (
    <>
      <div className="hidden items-center gap-3 xl:flex">
        <p className="text-[13px] leading-[1.72] text-muted">{text.stepOf(step, 4)}</p>
        <span className="flex-1" />
        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            className="rounded-md border border-border-strong bg-raised px-[21px] py-[13px] text-[14.5px] leading-[1.72] font-semibold text-text transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {text.saveDraft}
          </button>
        )}
        <button
          type="submit"
          form={formId}
          disabled={isBusy}
          aria-busy={isBusy || undefined}
          className="flex items-center gap-2 rounded-md bg-brand px-7 py-3.5 text-[15px] leading-[1.72] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
        >
          {primaryLabel}
          {isBusy && <Spinner size={17} />}
          {!isBusy && <IconNextArrow />}
        </button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-raised px-4 pt-3 pb-[22px] xl:hidden">
        <button
          type="submit"
          form={formId}
          disabled={isBusy}
          aria-busy={isBusy || undefined}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand py-3.5 text-[15px] leading-[1.72] font-semibold text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
        >
          {isBusy && <Spinner size={17} />}
          {primaryLabel}
        </button>
      </div>
    </>
  );
}
