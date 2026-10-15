import clsx from 'clsx';

/**
 * Figma «مفتاح» (79:1669 off, 79:1676 on): a 46 × 26 pill, 3px inside; off = border/strong with
 * the 20px white knob at the start, on = brand/solid with the knob at the end (it slides toward
 * the end in either direction). A `role="switch"` button, named by the text next to it.
 *
 * @param {{
 *   checked: boolean,
 *   onChange?: (checked: boolean) => void,
 *   disabled?: boolean,
 *   labelledBy: string,
 *   describedBy?: string,
 * }} props
 */
export function Switch({ checked, onChange, disabled = false, labelledBy, describedBy }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        'flex h-[26px] w-[46px] shrink-0 items-center rounded-full p-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60',
        checked ? 'bg-brand' : 'bg-border-strong',
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          'size-5 rounded-full bg-white shadow-sm transition-transform',
          checked && 'translate-x-5 rtl:-translate-x-5',
        )}
      />
    </button>
  );
}
