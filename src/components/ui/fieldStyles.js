import clsx from 'clsx';

// Figma "حقل إدخال / Input": عادي / مركّز / خطأ / معطّل.
// Focus draws a 2px brand border and error a 1.5px danger border (1px border + inset ring,
// so the field doesn't shift).

export const labelClasses = 'text-[14px] font-semibold leading-[1.6] text-text';

/** @param {{ invalid?: boolean, className?: string }} [options] */
export function fieldBoxClasses({ invalid, className } = {}) {
  return clsx(
    'rounded-md border bg-bg text-[15px] text-text transition-colors',
    'has-disabled:border-border has-disabled:bg-inset has-disabled:text-muted',
    invalid
      ? 'border-danger ring-[0.5px] ring-danger ring-inset'
      : 'border-border-strong focus-within:border-brand focus-within:ring-1 focus-within:ring-brand focus-within:ring-inset',
    className,
  );
}

/** Classes for the native control inside the field box. */
export const controlClasses =
  'w-full min-w-0 bg-transparent px-4 py-3 outline-none placeholder:text-muted disabled:cursor-not-allowed';

/** @param {{ invalid?: boolean }} [options] */
export function helpTextClasses({ invalid } = {}) {
  return clsx('text-caption', invalid ? 'text-danger' : 'text-muted');
}
