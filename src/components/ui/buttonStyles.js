import clsx from 'clsx';

/** @typedef {'primary'|'secondary'|'ghost'|'danger'} ButtonVariant */
/** @typedef {'lg'|'sm'} ButtonSize */

// Figma "زر / Button": أساسي / ثانوي / شبح / خطر × كبير / صغير.
const variants = {
  primary: 'bg-brand text-inverse hover:bg-brand-hover',
  secondary: 'border border-border-strong bg-surface text-text hover:bg-inset',
  ghost: 'text-brand-text hover:bg-brand-subtle',
  danger: 'bg-danger text-inverse hover:opacity-90',
};

const sizes = {
  lg: 'px-[22px] py-3 text-[15px]',
  sm: 'px-4 py-2 text-[13px]',
};

/**
 * Button classes, shared by `<Button>` and links that look like buttons.
 * @param {{ variant?: ButtonVariant, size?: ButtonSize, fullWidth?: boolean, className?: string }} [options]
 */
export function buttonClasses({ variant = 'primary', size = 'lg', fullWidth, className } = {}) {
  return clsx(
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold leading-[1.6] whitespace-nowrap transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    'disabled:pointer-events-none disabled:opacity-60',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className,
  );
}
