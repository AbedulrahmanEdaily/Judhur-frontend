import { useId } from 'react';
import { Switch } from '../../../components/ui/Switch.jsx';
import { ar } from '../../../locales/ar.js';

/**
 * One row of «التفضيلات» (Figma 79:1668): the name 14.5 semibold and its line 12.5 muted at the
 * start, the switch at the end, 14 apart, 6 above and below. `soon` marks a preference the API
 * can't save yet: the switch shows how it works today and stays disabled, with «قريباً».
 *
 * @param {{
 *   title: string,
 *   hint: string,
 *   checked: boolean,
 *   onChange?: (checked: boolean) => void,
 *   soon?: boolean,
 * }} props
 */
export function PreferenceRow({ title, hint, checked, onChange, soon = false }) {
  const titleId = useId();
  const hintId = useId();

  return (
    <div className="flex items-center gap-3.5 py-1.5">
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <p className="flex flex-wrap items-center gap-2">
          <span id={titleId} className="text-[14.5px] leading-[1.72] font-semibold text-text">
            {title}
          </span>
          {soon && (
            <span className="rounded-full bg-inset px-2 py-0.5 text-[11px] leading-[1.72] font-semibold text-muted">
              {ar.accountNav.soon}
            </span>
          )}
        </p>
        <p id={hintId} className="text-[12.5px] leading-[1.72] text-muted">
          {hint}
        </p>
      </div>
      <Switch
        checked={checked}
        onChange={onChange}
        disabled={soon}
        labelledBy={titleId}
        describedBy={hintId}
      />
    </div>
  );
}
