import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';

/** @typedef {{ value: string, label: string }} SelectMenuOption */

/**
 * The dropdown every select in the app uses: a button and the Figma Select menu «القائمة»
 * (46:833) — raised card, 1px border, radius/md, shadow-menu, 14×10 options, the chosen one on
 * brand/subtle. A native `<select>` list is drawn by the browser and is hard to read in dark
 * mode, so this listbox is used instead. Keyboard: arrows, Home/End, Enter/Space, Escape, Tab.
 * The caller styles the button (`buttonClassName`) and fills it (`children`).
 *
 * @param {{
 *   value: string,
 *   options: SelectMenuOption[],
 *   onChange: (value: string) => void,
 *   onBlur?: () => void,
 *   id?: string,
 *   buttonRef?: (node: HTMLButtonElement | null) => void,
 *   listLabel: string,
 *   buttonClassName: string,
 *   listClassName?: string,
 *   disabled?: boolean,
 *   invalid?: boolean,
 *   describedBy?: string,
 *   children: import('react').ReactNode,
 * }} props
 */
export function SelectMenu({
  value,
  options,
  onChange,
  onBlur,
  id,
  buttonRef,
  listLabel,
  buttonClassName,
  listClassName,
  disabled,
  invalid,
  describedBy,
  children,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const ownButtonRef = useRef(null);
  const listRef = useRef(null);
  const openedOnPressRef = useRef(false);
  const listId = useId();

  const selectedIndex = options.findIndex((option) => option.value === value);

  // While open: keyboard focus on the list, and a click outside closes it (and counts as
  // leaving the field, for the form's "touched").
  useEffect(() => {
    if (!isOpen) return undefined;
    listRef.current.focus();

    function handlePointerDown(event) {
      if (containerRef.current.contains(event.target)) return;
      setIsOpen(false);
      if (onBlur) onBlur();
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, onBlur]);

  // A long list scrolls: keep the active option in view.
  useEffect(() => {
    if (!isOpen) return;
    const activeOption = document.getElementById(`${listId}-${activeIndex}`);
    if (activeOption) activeOption.scrollIntoView({ block: 'nearest' });
  }, [isOpen, activeIndex, listId]);

  function setButtonNode(node) {
    ownButtonRef.current = node;
    if (buttonRef) buttonRef(node);
  }

  function open() {
    let startIndex = selectedIndex;
    if (startIndex < 0) startIndex = 0;
    setActiveIndex(startIndex);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    ownButtonRef.current.focus();
  }

  function choose(index) {
    close();
    if (options[index].value !== value) onChange(options[index].value);
  }

  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  // The mouse opens the list on press, like a native select: if the page moves before the
  // release (a field above validates on blur and its error line goes away), a click would be lost.
  function handleButtonMouseDown(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    openedOnPressRef.current = true;
    toggle();
  }

  // Keyboard (Enter / Space) arrives as a click without a press.
  function handleButtonClick() {
    if (openedOnPressRef.current) {
      openedOnPressRef.current = false;
      return;
    }
    toggle();
  }

  function handleButtonKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open();
    }
  }

  // Blur (for the form's "touched") only once focus leaves the button and its list together.
  function handleBlur(event) {
    if (onBlur && !containerRef.current.contains(event.relatedTarget)) onBlur();
  }

  function handleListKeyDown(event) {
    const lastIndex = options.length - 1;
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
      if (onBlur) onBlur();
    }
  }

  return (
    <div ref={containerRef} onBlur={handleBlur} className="relative">
      <button
        ref={setButtonNode}
        id={id}
        type="button"
        onMouseDown={handleButtonMouseDown}
        onClick={handleButtonClick}
        onKeyDown={handleButtonKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={buttonClassName}
      >
        {children}
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={listLabel}
          aria-activedescendant={`${listId}-${activeIndex}`}
          onKeyDown={handleListKeyDown}
          className={clsx(
            'absolute top-full z-30 mt-2 flex max-h-[284px] min-w-full flex-col gap-0.5 overflow-y-auto rounded-md border border-border bg-raised py-[5px] shadow-menu outline-none',
            listClassName,
          )}
        >
          {options.map((option, index) => {
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
                  'shrink-0 cursor-pointer px-[14px] py-[10px] text-[13.5px] leading-[1.72] whitespace-nowrap text-text',
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
