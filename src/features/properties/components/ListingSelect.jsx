import { useId } from 'react';
import { useController } from 'react-hook-form';
import clsx from 'clsx';
import { IconFieldChevron } from '../../../components/icons/index.js';
import { SelectMenu } from '../../../components/ui/SelectMenu.jsx';

/**
 * Dropdown of the listing forms — Figma "أضف عقار" field (77:1247): the ListingInput box with
 * the 17px chevron (text/muted) at the end and a 10px gap. The list is the shared SelectMenu
 * (Figma Select menu 46:833). Bound to the form with useController (`control` + `name`); the
 * placeholder shows in text/muted while nothing is chosen.
 *
 * @param {{
 *   control: import('react-hook-form').Control<any>,
 *   name: string,
 *   label: string,
 *   options: { value: string, label: string }[],
 *   placeholder?: string,
 *   error?: string,
 *   hint?: string,
 *   className?: string,
 * }} props
 */
export function ListingSelect({
  control,
  name,
  label,
  options,
  placeholder,
  error,
  hint,
  className,
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const helpText = error || hint;
  const { field } = useController({ control, name });

  const selected = options.find((option) => option.value === field.value);
  let shownText = placeholder ?? '';
  if (selected) shownText = selected.label;

  return (
    <div className={clsx('flex min-w-0 flex-col gap-1.5 xl:gap-[7px]', className)}>
      <label
        htmlFor={id}
        className="text-[13px] leading-[1.72] font-semibold text-text xl:text-[13.5px]"
      >
        {label}
      </label>
      <SelectMenu
        id={id}
        buttonRef={field.ref}
        value={field.value}
        options={options}
        onChange={field.onChange}
        onBlur={field.onBlur}
        listLabel={label}
        invalid={Boolean(error)}
        describedBy={helpText ? helpId : undefined}
        buttonClassName={clsx(
          'flex w-full cursor-pointer items-center gap-2.5 rounded-md border bg-bg py-[11px] ps-[13px] pe-[13px] text-start text-[14px] leading-[1.72] transition-colors outline-none xl:text-[14.5px]',
          error && 'border-danger ring-[0.5px] ring-danger ring-inset',
          !error &&
            'border-border-strong focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand focus-visible:ring-inset aria-expanded:border-brand aria-expanded:ring-1 aria-expanded:ring-brand aria-expanded:ring-inset',
        )}
      >
        <span className={clsx('min-w-0 flex-1 truncate', selected ? 'text-text' : 'text-muted')}>
          {shownText}
        </span>
        <IconFieldChevron className="shrink-0 text-muted" />
      </SelectMenu>
      {helpText && (
        <p id={helpId} className={clsx('text-caption', error ? 'text-danger' : 'text-muted')}>
          {helpText}
        </p>
      )}
    </div>
  );
}
