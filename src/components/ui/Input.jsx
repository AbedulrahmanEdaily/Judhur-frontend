import { useId } from 'react';
import clsx from 'clsx';
import { controlClasses, fieldBoxClasses, helpTextClasses, labelClasses } from './fieldStyles.js';

/**
 * Text input with a label above and hint/error text below.
 * Works with React Hook Form's `register()` (the ref is forwarded as a prop).
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
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  const helpText = error || hint;

  return (
    <div className={clsx('flex flex-col gap-2', disabled && 'opacity-60', className)}>
      <label htmlFor={inputId} className={labelClasses}>
        {label}
      </label>
      <div className={fieldBoxClasses({ invalid: Boolean(error), className: 'flex items-center' })}>
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpText ? helpId : undefined}
          className={controlClasses}
          {...rest}
        />
        {suffix && <span className="pe-4 text-[13px] whitespace-nowrap text-muted">{suffix}</span>}
      </div>
      {helpText && (
        <p id={helpId} className={helpTextClasses({ invalid: Boolean(error) })}>
          {helpText}
        </p>
      )}
    </div>
  );
}
