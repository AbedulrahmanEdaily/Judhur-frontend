import { useId } from 'react';
import clsx from 'clsx';

/**
 * Text field of the listing forms — Figma "أضف عقار" field (77:1240): label 13.5/1.72 semibold
 * (13 on mobile, 84:689), 7px gap (6 on mobile), box radius md with a 1px border/strong on
 * bg/canvas and 14×12 padding (13×11 here, as the stroke is inside in Figma), value 14.5 (14 on
 * mobile), and the unit (₪, م²) muted 12.5 at the end with a 10px gap. Works with register().
 *
 * @param {import('react').InputHTMLAttributes<HTMLInputElement> & {
 *   label: string,
 *   error?: string,
 *   hint?: string,
 *   suffix?: string,
 *   ref?: import('react').Ref<HTMLInputElement>,
 * }} props
 */
export function ListingInput({ label, error, hint, suffix, className, ...rest }) {
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
          'flex items-center gap-2.5 rounded-md border bg-bg px-[13px] text-text transition-colors',
          error && 'border-danger ring-[0.5px] ring-danger ring-inset',
          !error &&
            'border-border-strong focus-within:border-brand focus-within:ring-1 focus-within:ring-brand focus-within:ring-inset',
        )}
      >
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpText ? helpId : undefined}
          className="w-full min-w-0 bg-transparent py-[11px] text-[14px] leading-[1.72] outline-none placeholder:text-muted xl:text-[14.5px]"
          {...rest}
        />
        {suffix && (
          <span className="shrink-0 text-[12.5px] leading-[1.72] text-muted">{suffix}</span>
        )}
      </div>
      {helpText && (
        <p id={helpId} className={clsx('text-caption', error ? 'text-danger' : 'text-muted')}>
          {helpText}
        </p>
      )}
    </div>
  );
}
