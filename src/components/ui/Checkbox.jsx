import clsx from 'clsx';
import { IconCheckboxCheck } from '../icons/index.js';

/**
 * The checkbox drawn on the auth screens ("مربع", 69:1254): 18px square, radius 6, brand/solid
 * with the 12px check in text/inverse; label Body 13/1.75 in text/secondary, 10px gap.
 * Figma only shows the checked state — unchecked uses border/strong on bg/canvas
 * (see "Not in Figma" in DESIGN.md).
 *
 * @param {import('react').InputHTMLAttributes<HTMLInputElement> & {
 *   label: import('react').ReactNode,
 *   ref?: import('react').Ref<HTMLInputElement>,
 * }} props
 */
export function Checkbox({ label, className, disabled, ...rest }) {
  return (
    <label
      className={clsx(
        'inline-flex cursor-pointer items-center gap-2.5',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <span className="relative inline-flex size-[18px] shrink-0">
        <input
          type="checkbox"
          disabled={disabled}
          className="peer absolute inset-0 m-0 size-full cursor-[inherit] appearance-none rounded-[6px] border border-border-strong bg-bg checked:border-brand checked:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          {...rest}
        />
        <IconCheckboxCheck className="pointer-events-none absolute inset-0 m-auto hidden text-inverse peer-checked:block" />
      </span>
      <span className="text-[13px] leading-[1.75] text-text-secondary">{label}</span>
    </label>
  );
}
