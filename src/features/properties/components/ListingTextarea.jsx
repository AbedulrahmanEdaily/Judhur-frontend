import { useId } from 'react';
import clsx from 'clsx';

/**
 * Description box of the listing forms — Figma "الوصف" (77:1268): the ListingInput label and
 * border, 14px sides, 12 top and room for three lines (the Figma box is 75px with a 40px bottom
 * padding); placeholder 13.5 muted. Works with register().
 *
 * @param {import('react').TextareaHTMLAttributes<HTMLTextAreaElement> & {
 *   label: string,
 *   error?: string,
 *   hint?: string,
 *   ref?: import('react').Ref<HTMLTextAreaElement>,
 * }} props
 */
export function ListingTextarea({ label, error, hint, className, rows = 3, ...rest }) {
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
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={helpText ? helpId : undefined}
        className={clsx(
          'w-full resize-y rounded-md border bg-bg px-[13px] py-[11px] text-[14px] leading-[1.72] text-text outline-none placeholder:text-[13.5px] placeholder:text-muted xl:text-[14.5px]',
          error && 'border-danger ring-[0.5px] ring-danger ring-inset',
          !error &&
            'border-border-strong focus:border-brand focus:ring-1 focus:ring-brand focus:ring-inset',
        )}
        {...rest}
      />
      {helpText && (
        <p id={helpId} className={clsx('text-caption', error ? 'text-danger' : 'text-muted')}>
          {helpText}
        </p>
      )}
    </div>
  );
}
