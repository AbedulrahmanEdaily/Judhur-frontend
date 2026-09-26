import { useId } from 'react';
import clsx from 'clsx';

/**
 * Figma "حقل إدخال / Input" (32:139): label 14/1.7, gap 8, box 16×12 with a 10px gap to the
 * suffix, value 15/1.7, helper 12/1.7. States: focus = 2px brand border, error = 1.5px danger
 * border, disabled = inset background at 60% opacity. Works with React Hook Form's register().
 *
 * @param {import('react').InputHTMLAttributes<HTMLInputElement> & {
 *   label: string,
 *   hint?: string,
 *   error?: string,
 *   suffix?: import('react').ReactNode,
 *   ref?: import('react').Ref<HTMLInputElement>,
 * }} props
 */
export function Input({ label, hint, error, suffix, id, className, disabled, ...rest }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helpId = `${inputId}-help`;
  const helpText = error || hint;

  return (
    <div className={clsx('flex flex-col gap-2', disabled && 'opacity-60', className)}>
      <label htmlFor={inputId} className="text-[14px] leading-[1.7] font-semibold text-text">
        {label}
      </label>

      {/* 1px border + inset ring draws the thicker focus/error border without moving the text. */}
      <div
        className={clsx(
          'flex items-center gap-2.5 rounded-md border bg-bg px-[15px] text-text transition-colors',
          'has-disabled:border-border has-disabled:bg-inset has-disabled:text-muted',
          error && 'border-danger ring-[0.5px] ring-danger ring-inset',
          !error &&
            'border-border-strong focus-within:border-brand focus-within:ring-1 focus-within:ring-brand focus-within:ring-inset',
        )}
      >
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpText ? helpId : undefined}
          className="w-full min-w-0 bg-transparent py-[11px] text-[15px] leading-[1.7] outline-none placeholder:text-muted disabled:cursor-not-allowed"
          {...rest}
        />
        {suffix && (
          <span className="shrink-0 text-[13px] leading-[1.7] whitespace-nowrap text-muted">
            {suffix}
          </span>
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
