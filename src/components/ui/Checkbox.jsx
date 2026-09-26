import { useId } from 'react';
import clsx from 'clsx';

/**
 * @param {import('react').InputHTMLAttributes<HTMLInputElement> & {
 *   label: string,
 *   ref?: import('react').Ref<HTMLInputElement>,
 * }} props
 */
export function Checkbox({ label, id, className, disabled, ...rest }) {
  const autoId = useId();
  const checkboxId = id ?? autoId;

  return (
    <div className={clsx('flex items-center gap-2', disabled && 'opacity-60', className)}>
      <input
        id={checkboxId}
        type="checkbox"
        disabled={disabled}
        className="size-4 shrink-0 cursor-pointer accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed"
        {...rest}
      />
      <label htmlFor={checkboxId} className="text-label font-normal text-text">
        {label}
      </label>
    </div>
  );
}
