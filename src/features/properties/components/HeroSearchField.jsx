import { useId } from 'react';
import { IconSelectChevron } from '../../../components/icons/index.js';

/**
 * One field of the home search bar (Figma 49:599…): label 11.5 muted over the value 14.5 with
 * the 16px chevron at the end. A native select, so it works with the keyboard and screen readers.
 *
 * @param {{
 *   label: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   options: { value: string, label: string }[],
 * }} props
 */
export function HeroSearchField({ label, value, onChange, options }) {
  const selectId = useId();

  return (
    <div className="relative flex min-w-0 flex-1 flex-col gap-[3px] px-5 py-2.5">
      <label
        htmlFor={selectId}
        className="text-[11.5px] leading-[1.68] font-semibold whitespace-nowrap text-muted"
      >
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full cursor-pointer appearance-none rounded-sm bg-transparent pe-[22px] text-[14.5px] leading-[1.68] text-text outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <IconSelectChevron className="pointer-events-none absolute end-5 bottom-[14px] text-muted" />
    </div>
  );
}
