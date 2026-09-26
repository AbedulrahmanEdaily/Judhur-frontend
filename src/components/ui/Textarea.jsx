import { useId } from 'react';
import clsx from 'clsx';
import { controlClasses, fieldBoxClasses, helpTextClasses, labelClasses } from './fieldStyles.js';

/**
 * Multi-line counterpart of `<Input>` (same field styles).
 *
 * @param {import('react').TextareaHTMLAttributes<HTMLTextAreaElement> & {
 *   label: string,
 *   hint?: string,
 *   error?: string,
 *   ref?: import('react').Ref<HTMLTextAreaElement>,
 * }} props
 */
export function Textarea({ label, hint, error, id, className, disabled, rows = 4, ...rest }) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const helpId = `${textareaId}-help`;
  const helpText = error || hint;

  return (
    <div className={clsx('flex flex-col gap-2', disabled && 'opacity-60', className)}>
      <label htmlFor={textareaId} className={labelClasses}>
        {label}
      </label>
      <div className={fieldBoxClasses({ invalid: Boolean(error) })}>
        <textarea
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={helpText ? helpId : undefined}
          className={clsx(controlClasses, 'resize-y')}
          {...rest}
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
