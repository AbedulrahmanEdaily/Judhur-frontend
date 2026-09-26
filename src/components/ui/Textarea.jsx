import { useId } from 'react';
import clsx from 'clsx';

/**
 * Multi-line field. Figma has no textarea, so it copies the Input component (32:139) metrics
 * (listed under "Not in Figma" in DESIGN.md).
 *
 * @param {import('react').TextareaHTMLAttributes<HTMLTextAreaElement> & {
 *   label: string,
 *   hint?: string,
 *   error?: string,
 *   ref?: import('react').Ref<HTMLTextAreaElement>,
 * }} props
 */
export function Textarea({ label, hint, error, id, className, disabled, rows = 4, ...rest }) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const helpId = `${textareaId}-help`;
  const helpText = error || hint;

  return (
    <div className={clsx('flex flex-col gap-2', disabled && 'opacity-60', className)}>
      <label htmlFor={textareaId} className="text-[14px] leading-[1.7] font-semibold text-text">
        {label}
      </label>

      <textarea
        id={textareaId}
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={helpText ? helpId : undefined}
        className={clsx(
          'w-full resize-y rounded-md border bg-bg px-[15px] py-[11px] text-[15px] leading-[1.7] text-text outline-none placeholder:text-muted',
          'disabled:cursor-not-allowed disabled:border-border disabled:bg-inset',
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
