import { IconSort } from '../../../components/icons/index.js';
import { SelectMenu } from '../../../components/ui/SelectMenu.jsx';
import { ar } from '../../../locales/ar.js';
import { SORT_OPTIONS } from '../constants.js';

/**
 * The sort pill of Figma "شريط الأدوات" (53:850): «ترتيب:» then the chosen order and the sort
 * icon. The list it opens is the shared SelectMenu (Figma Select menu 46:833).
 *
 * @param {{ value: string, onChange: (value: string) => void }} props
 */
export function SortMenu({ value, onChange }) {
  let selected = SORT_OPTIONS.find((option) => option.value === value);
  if (!selected) selected = SORT_OPTIONS[0];

  return (
    <SelectMenu
      value={selected.value}
      options={SORT_OPTIONS}
      onChange={onChange}
      listLabel={ar.search.sortMenu}
      listClassName="end-0"
      buttonClassName="group flex items-center gap-2 rounded-[10px] border border-border bg-surface px-[13px] py-2 transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span className="text-[13px] leading-[1.7] text-muted">{ar.search.sortLabel}</span>
      <span className="text-[13.5px] leading-[1.7] font-semibold text-text">{selected.label}</span>
      <IconSort className="text-muted transition-transform group-aria-expanded:rotate-180" />
    </SelectMenu>
  );
}
