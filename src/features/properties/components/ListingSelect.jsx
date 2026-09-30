import { useId } from 'react';
import clsx from 'clsx';
import { IconFieldChevron } from '../../../components/icons/index.js';

/**
 * Dropdown of the listing forms — Figma "أضف عقار" field (77:1247): the ListingInput box with
 * the 17px chevron (text/muted) at the end and a 10px gap. A native `<select>`; the page's
 * color-scheme makes its open list follow the theme. Works with register().
 *
 * @param {import('react').SelectHTMLAttributes<HTMLSelectElement> & {
 *   label: string,
 *   options: { value: string, label: string }[],
 *   placeholder?: string,
 *   error?: string,
 *   hint?: string,
 *   ref?: import('react').Ref<HTMLSelectElement>,
 * }} props
 */
export function ListingSelect({ label, options, placeholder, error, hint, className, ...rest }) {
  const id = useId();
  const helpId = `${id}-help`;
  const helpText = error || hint;

  return (
    <div className={clsx('flex min-w-0 flex-col gap-1.5 xl:gap-[7px]', className)}>
      <label
        htmlFor={id}
        className="text-[13px] leading-[1.72] font-semibold text-text xl:text-[13.5px]"
      >
        {label}
      </label>
      <div
        className={clsx(
          'relative rounded-md border bg-bg text-text transition-colors',
          'has-disabled:border-border has-disabled:bg-inset has-disabled:text-muted',
          error && 'border-danger ring-[0.5px] ring-danger ring-inset',
          !error &&
            'border-border-strong focus-within:border-brand focus-within:ring-1 focus-within:ring-brand focus-within:ring-inset',
        )}
      >
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpText ? helpId : undefined}
          className="w-full cursor-pointer appearance-none bg-transparent py-[11px] ps-[13px] pe-[40px] text-[14px] leading-[1.72] outline-none disabled:cursor-not-allowed xl:text-[14.5px]"
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <IconFieldChevron className="pointer-events-none absolute end-[13px] top-1/2 -translate-y-1/2 text-muted" />
      </div>
      {helpText && (
        <p id={helpId} className={clsx('text-caption', error ? 'text-danger' : 'text-muted')}>
          {helpText}
        </p>
      )}
    </div>
  );
}
