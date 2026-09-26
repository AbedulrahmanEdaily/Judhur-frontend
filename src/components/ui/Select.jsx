import { useId } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { fieldBoxClasses, helpTextClasses, labelClasses } from './fieldStyles.js';

/** @typedef {{ value: string, label: string }} SelectOption */

/**
 * Native `<select>` styled like Figma "قائمة منسدلة / Select".
 * Options show the Arabic label and submit the API value.
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
      <label htmlFor={selectId} className={labelClasses}>
        {label}
      </label>
      <div className={fieldBoxClasses({ invalid: Boolean(error), className: 'relative' })}>
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpText ? helpId : undefined}
          className="w-full appearance-none bg-transparent py-3 ps-4 pe-10 text-[14.5px] outline-none disabled:cursor-not-allowed"
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
      {helpText && (
        <p id={helpId} className={helpTextClasses({ invalid: Boolean(error) })}>
          {helpText}
        </p>
      )}
    </div>
  );
}
