import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconSort } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import { SORT_OPTIONS } from '../constants.js';

/**
 * The sort pill of Figma "شريط الأدوات" (53:850). The list it opens follows the Figma Select
 * menu "القائمة" (46:833): raised card, 1px border, radius/md, shadow-menu, 14×10 options, the
 * chosen one on brand/subtle. A native `<select>` list is drawn by the browser and was hard to
 * read in dark mode, so this is a small listbox instead.
 *
 * @param {{ value: string, onChange: (value: string) => void }} props
 */
export function SortMenu({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  let selectedIndex = SORT_OPTIONS.findIndex((option) => option.value === value);
  if (selectedIndex < 0) selectedIndex = 0;

  // While open: keyboard focus on the list, and a click outside closes it.
  useEffect(() => {
    if (!isOpen) return undefined;
    listRef.current.focus();

    function handlePointerDown(event) {
      if (!containerRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  function open() {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    buttonRef.current.focus();
  }

  function choose(index) {
    close();
    if (SORT_OPTIONS[index].value !== value) onChange(SORT_OPTIONS[index].value);
  }

  function handleButtonKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open();
    }
  }

  function handleListKeyDown(event) {
    const lastIndex = SORT_OPTIONS.length - 1;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, lastIndex));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(lastIndex);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(activeIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-[13px] py-2 transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span className="text-[13px] leading-[1.7] text-muted">{ar.search.sortLabel}</span>
        <span className="text-[13.5px] leading-[1.7] font-semibold text-text">
          {SORT_OPTIONS[selectedIndex].label}
        </span>
        <IconSort className={clsx('text-muted transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={ar.search.sortMenu}
          aria-activedescendant={`${listId}-${activeIndex}`}
          onKeyDown={handleListKeyDown}
          className="absolute end-0 top-full z-20 mt-2 flex min-w-full flex-col gap-0.5 overflow-hidden rounded-md border border-border bg-raised py-[5px] shadow-menu outline-none"
        >
          {SORT_OPTIONS.map((option, index) => {
            const isSelected = index === selectedIndex;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(index)}
                onPointerEnter={() => setActiveIndex(index)}
                className={clsx(
                  'cursor-pointer px-[14px] py-[10px] text-[13.5px] leading-[1.72] whitespace-nowrap text-text',
                  isSelected && 'bg-brand-subtle font-semibold',
                  isActive && !isSelected && 'bg-inset',
                )}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
