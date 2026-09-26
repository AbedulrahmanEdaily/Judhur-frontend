import { buttonClasses } from './buttonStyles.js';
import { Spinner } from './Spinner.jsx';

/**
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & {
 *   variant?: import('./buttonStyles.js').ButtonVariant,
 *   size?: import('./buttonStyles.js').ButtonSize,
 *   fullWidth?: boolean,
 *   loading?: boolean,
 *   ref?: import('react').Ref<HTMLButtonElement>,
 * }} props
 */
export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth,
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
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading && <Spinner size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}
