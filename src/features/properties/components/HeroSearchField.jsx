import { useId } from 'react';
import { IconSelectChevron } from '../../../components/icons/index.js';
import { SelectMenu } from '../../../components/ui/SelectMenu.jsx';

/**
 * One field of the home search bar (Figma 49:599…): label 11.5 muted over the value 14.5 with
 * the 16px chevron at the end. The list is the shared SelectMenu (Figma Select menu 46:833).
 *
 * @param {{
 *   label: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   options: { value: string, label: string }[],
 * }} props
 */
export function HeroSearchField({ label, value, onChange, options }) {
  const buttonId = useId();
  let selected = options.find((option) => option.value === value);
  if (!selected) selected = options[0];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[3px] px-5 py-2.5">
      <label
        htmlFor={buttonId}
        className="text-[11.5px] leading-[1.68] font-semibold whitespace-nowrap text-muted"
      >
        {label}
      </label>
      <SelectMenu
        id={buttonId}
        value={value}
        options={options}
        onChange={onChange}
        listLabel={label}
        buttonClassName="flex w-full items-center gap-1.5 rounded-sm text-start text-[14.5px] leading-[1.68] text-text outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className="min-w-0 flex-1 truncate">{selected.label}</span>
        <IconSelectChevron className="shrink-0 text-muted" />
      </SelectMenu>
    </div>
  );
}
