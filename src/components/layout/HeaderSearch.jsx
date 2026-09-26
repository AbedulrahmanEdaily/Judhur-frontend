import { useId } from 'react';
import clsx from 'clsx';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ar } from '../../locales/ar.js';

/** Figma navbar "بحث": sends the text to the search page as `searchTerm`. */
export function HeaderSearch({ className, onSubmitted }) {
  const navigate = useNavigate();
  const inputId = useId();

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const term = new FormData(event.currentTarget).get('searchTerm')?.toString().trim();
        navigate(term ? `/properties?${new URLSearchParams({ searchTerm: term })}` : '/properties');
        onSubmitted?.();
      }}
      className={clsx(
        'flex h-10 items-center gap-2 rounded-md bg-inset px-3.5 focus-within:ring-1 focus-within:ring-brand',
        className,
      )}
    >
      <label htmlFor={inputId} className="sr-only">
        {ar.nav.searchLabel}
      </label>
      <Search size={16} aria-hidden="true" className="shrink-0 text-muted" />
      <input
        id={inputId}
        name="searchTerm"
        type="search"
        placeholder={ar.nav.searchPlaceholder}
        className="w-full min-w-0 bg-transparent text-[13px] text-text outline-none placeholder:text-muted"
      />
    </form>
  );
}
