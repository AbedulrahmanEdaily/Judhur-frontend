import { useId } from 'react';
import clsx from 'clsx';
import { IconChevronDown } from '../icons/index.js';

/** @typedef {{ value: string, label: string }} SelectOption */

/**
 * Figma "قائمة منسدلة / Select" (46:827) trigger: label 14/1.72 semibold, gap 8; box padding
 * 16 (text side) × 12, 14 on the chevron side, value 14.5/1.72, 18px chevron (text/muted) with a
 * 10px gap. A native `<select>` is used, so the open list is drawn by the browser — see
 * DESIGN.md for the Figma menu styling that a native list cannot take.
 *
 * @param {import('react').SelectHTMLAttributes<HTMLSelectElement> & {
 *   label: string,
 *   options: SelectOption[],
 *   placeholder?: string,
 *   hint?: string,
 *   error?: string,
 *   ref?: import('react').Ref<HTMLSelectElement>,
 * }} props
 */
export function Select({
  label,
  options,
  placeholder,
  hint,
  error,
  id,
  className,
  disabled,
  ...rest
}) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const helpId = `${selectId}-help`;
  const helpText = error || hint;

  return (
    <div className={clsx('flex flex-col gap-2', disabled && 'opacity-60', className)}>
      <label htmlFor={selectId} className="text-[14px] leading-[1.72] font-semibold text-text">
        {label}
      </label>
      <div
        className={clsx(
          'relative rounded-md border bg-bg text-text transition-colors',
          'has-disabled:border-border has-disabled:bg-inset',
          error
            ? 'border-danger ring-[0.5px] ring-danger ring-inset'
            : 'border-border-strong focus-within:border-brand focus-within:ring-1 focus-within:ring-brand focus-within:ring-inset',
        )}
      >
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpText ? helpId : undefined}
          className="w-full appearance-none bg-transparent py-[11px] ps-[15px] pe-[41px] text-[14.5px] leading-[1.72] outline-none disabled:cursor-not-allowed"
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <IconChevronDown className="pointer-events-none absolute end-[13px] top-1/2 -translate-y-1/2 text-muted" />
      </div>
      {helpText && (
        <p id={helpId} className={clsx('text-caption', error ? 'text-danger' : 'text-muted')}>
          {helpText}
        </p>
      )}
    </div>
  );
}
