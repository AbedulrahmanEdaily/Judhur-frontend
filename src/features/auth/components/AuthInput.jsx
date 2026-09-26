import { useId } from 'react';
import clsx from 'clsx';

/**
 * The text field drawn on the auth screens (Figma 69:1240 desktop, 84:780 mobile).
 * Desktop: label 13.5/1.75, gap 7, box 15×13 padding, value 14.5/1.75.
 * Mobile: label 13/1.72, gap 6, box 14×13 padding, value 14/1.72.
 * Focus / error borders come from the Input component (32:139).
 *
 * @param {import('react').InputHTMLAttributes<HTMLInputElement> & {
 *   label: string,
 *   hint?: string,
 *   error?: string,
 *   suffix?: import('react').ReactNode,
 *   ref?: import('react').Ref<HTMLInputElement>,
 * }} props
 */
export function AuthInput({ label, hint, error, suffix, id, className, ...rest }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helpId = `${inputId}-help`;
  const helpText = error || hint;

  return (
    <div className={clsx('flex flex-col gap-1.5 text-start xl:gap-[7px]', className)}>
      <label
        htmlFor={inputId}
        className="text-[13px] leading-[1.72] font-semibold text-text xl:text-[13.5px] xl:leading-[1.75]"
      >
        {label}
      </label>

      {/* 1px border + inset ring draws the thicker focus/error border without moving the text. */}
      <div
        className={clsx(
          'flex items-center gap-2 rounded-md border bg-bg px-[13px] text-text transition-colors xl:gap-2.5 xl:px-3.5',
          error && 'border-danger ring-[0.5px] ring-danger ring-inset',
          !error &&
            'border-border-strong focus-within:border-brand focus-within:ring-1 focus-within:ring-brand focus-within:ring-inset',
        )}
      >
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpText ? helpId : undefined}
          className="w-full min-w-0 bg-transparent py-3 text-[14px] leading-[1.72] outline-none placeholder:text-muted xl:text-[14.5px] xl:leading-[1.75]"
          {...rest}
        />
        {suffix}
      </div>

      {helpText && (
        <p id={helpId} className={clsx('text-caption', error ? 'text-danger' : 'text-muted')}>
          {helpText}
        </p>
      )}
    </div>
  );
}
