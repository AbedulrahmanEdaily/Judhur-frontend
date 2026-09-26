import clsx from 'clsx';
import { Spinner } from './Spinner.jsx';

// Figma "زر / Button" (27:18): النوع أساسي / ثانوي / شبح / خطر.
// Every variant has a 1px border (transparent unless Figma draws one) so all of them share
// the same padding.
const variantClasses = {
  primary: 'border-transparent bg-brand text-inverse hover:bg-brand-hover',
  secondary: 'border-border-strong bg-surface text-text hover:bg-inset',
  ghost: 'border-transparent text-brand-text hover:bg-brand-subtle',
  danger: 'border-transparent bg-danger text-inverse hover:opacity-90',
};

// Figma "زر / Button": الحجم كبير (22×12, 15px) / صغير (16×8, 13px).
// Figma draws strokes inside the padding; CSS draws the border outside it, so 1px less here.
const sizeClasses = {
  lg: 'px-[21px] py-[11px] text-[15px]',
  sm: 'px-[15px] py-[7px] text-[13px]',
};

/**
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & {
 *   variant?: 'primary'|'secondary'|'ghost'|'danger',
 *   size?: 'lg'|'sm',
 *   fullWidth?: boolean,
 *   loading?: boolean,
 *   ref?: import('react').Ref<HTMLButtonElement>,
 * }} props
 */
export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-md border leading-[1.6] font-semibold whitespace-nowrap transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        'disabled:pointer-events-none disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && <Spinner size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}
