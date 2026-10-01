import clsx from 'clsx';
import { IconFilterCheck } from '../../../components/icons/index.js';

/**
 * A checkbox row of the filters panel (Figma 52:889): the 19px box «مربع» (radius 6, 1.4px
 * border/strong, brand when ticked, 13px check), the label (semibold text/primary when ticked,
 * text/secondary otherwise), and an optional colored dot for the land classes.
 *
 * @param {{
 *   label: string,
 *   checked: boolean,
 *   onChange: (checked: boolean) => void,
 *   dotClassName?: string,
 * }} props
 */
export function FilterOption({ label, checked, onChange, dotClassName }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <span className="relative size-[19px] shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer size-full cursor-pointer appearance-none rounded-[6px] border-[1.4px] border-border-strong checked:border-brand checked:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
        <IconFilterCheck className="pointer-events-none absolute start-[3px] top-[3px] hidden text-inverse peer-checked:block" />
      </span>
      <span
        className={clsx(
          'text-[13.5px] leading-[1.7]',
          checked ? 'font-semibold text-text' : 'text-text-secondary',
        )}
      >
        {label}
      </span>
      {dotClassName && <span className={clsx('size-[9px] shrink-0 rounded-full', dotClassName)} />}
    </label>
  );
}
