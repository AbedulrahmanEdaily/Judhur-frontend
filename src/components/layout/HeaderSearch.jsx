import { useId } from 'react';
import { IconSearch } from '../icons/index.js';
import { ar } from '../../locales/ar.js';

/**
 * Figma navbar "بحث": 230×40, bg/inset, radius md, 14×9 padding, 8 gap, 16px icon.
 * The search page is build step 5, so submitting does nothing yet.
 */
export function HeaderSearch() {
  const inputId = useId();

  return (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className="flex h-10 w-[230px] shrink-0 items-center gap-2 rounded-md bg-inset px-3.5 text-muted focus-within:ring-1 focus-within:ring-brand"
    >
      <label htmlFor={inputId} className="sr-only">
        {ar.nav.searchLabel}
      </label>
      <IconSearch className="shrink-0" />
      <input
        id={inputId}
        name="searchTerm"
        type="search"
        placeholder={ar.nav.searchPlaceholder}
        className="w-full min-w-0 bg-transparent text-[13px] leading-[1.65] text-text outline-none placeholder:text-muted"
      />
    </form>
  );
}
