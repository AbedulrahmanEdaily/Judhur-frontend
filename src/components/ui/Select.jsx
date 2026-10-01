import { useId } from 'react';
import clsx from 'clsx';
import { IconChevronDown } from '../icons/index.js';
import { SelectMenu } from './SelectMenu.jsx';

/** @typedef {{ value: string, label: string }} SelectOption */

/**
 * Figma "قائمة منسدلة / Select" (46:827): label 14/1.72 semibold, gap 8; box padding 16 (text
 * side) × 12, 14 on the chevron side, value 14.5/1.72, 18px chevron (text/muted) with a 10px
 * gap. The open list is the shared SelectMenu (Figma menu «القائمة» 46:833). Controlled:
 * `value` + `onChange(value)`; inside a form, bind it with useController.
 *
 * @param {{
 *   label: string,
 *   options: SelectOption[],
 *   value: string,
 *   onChange: (value: string) => void,
 *   onBlur?: () => void,
 *   placeholder?: string,
 *   hint?: string,
 *   error?: string,
 *   disabled?: boolean,
 *   id?: string,
 *   className?: string,
 * }} props
 */
export function Select({
  label,
  options,
  value,
  onChange,
  onBlur,
  placeholder,
  hint,
  error,
  disabled,
  id,
  className,
}) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const helpId = `${selectId}-help`;
  const helpText = error || hint;

  const selected = options.find((option) => option.value === value);
  let shownText = placeholder ?? '';
  if (selected) shownText = selected.label;

  return (
    <div className={clsx('flex flex-col gap-2', disabled && 'opacity-60', className)}>
      <label htmlFor={selectId} className="text-[14px] leading-[1.72] font-semibold text-text">
        {label}
      </label>
      <SelectMenu
        id={selectId}
        value={value}
        options={options}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        listLabel={label}
        invalid={Boolean(error)}
        describedBy={helpText ? helpId : undefined}
        buttonClassName={clsx(
          'flex w-full items-center gap-2.5 rounded-md border bg-bg py-[11px] ps-[15px] pe-[13px] text-start text-[14.5px] leading-[1.72] transition-colors outline-none disabled:cursor-not-allowed disabled:border-border disabled:bg-inset',
          error && 'border-danger ring-[0.5px] ring-danger ring-inset',
          !error &&
            'border-border-strong focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand focus-visible:ring-inset aria-expanded:border-brand aria-expanded:ring-1 aria-expanded:ring-brand aria-expanded:ring-inset',
        )}
      >
        <span className={clsx('min-w-0 flex-1 truncate', selected ? 'text-text' : 'text-muted')}>
          {shownText}
        </span>
        <IconChevronDown className="shrink-0 text-muted" />
      </SelectMenu>
      {helpText && (
        <p id={helpId} className={clsx('text-caption', error ? 'text-danger' : 'text-muted')}>
          {helpText}
        </p>
      )}
    </div>
  );
}
