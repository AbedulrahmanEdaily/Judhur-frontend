import { IconDeclarationCheck } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';

const text = ar.listing;

/**
 * Figma "إقرار الملكية" (94:2493): three statements, each with a 24px box (radius sm; checked:
 * brand with the 14px check, else 1.5px border/strong) and 15/1.75 text. They are confirmed in
 * the browser only — the API has no field for them — and all three are needed to send.
 *
 * @param {{
 *   checked: boolean[],
 *   onChange: (checked: boolean[]) => void,
 *   error?: string | null,
 * }} props
 */
export function OwnershipDeclarations({ checked, onChange, error }) {
  function toggle(index) {
    const next = [...checked];
    next[index] = !next[index];
    onChange(next);
  }

  return (
    <fieldset className="flex flex-col gap-3.5 xl:rounded-lg xl:border xl:border-border xl:bg-raised xl:px-[25px] xl:py-[23px]">
      <legend className="float-start mb-0 w-full text-[18px] leading-[1.55] font-semibold text-text xl:text-[20px]">
        {text.declarationsTitle}
      </legend>
      {text.declarations.map((statement, index) => (
        <label key={statement} className="flex cursor-pointer items-start gap-3">
          <span className="relative mt-px inline-flex size-6 shrink-0">
            <input
              type="checkbox"
              checked={checked[index]}
              onChange={() => toggle(index)}
              className="peer absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-sm border-[1.5px] border-border-strong bg-bg checked:border-brand checked:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            />
            <IconDeclarationCheck className="pointer-events-none absolute inset-0 m-auto hidden text-inverse peer-checked:block" />
          </span>
          <span className="text-[14px] leading-[1.75] text-text xl:text-[15px]">{statement}</span>
        </label>
      ))}
      {error && <p className="text-caption text-danger">{error}</p>}
    </fieldset>
  );
}
