import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { IconKebab } from '../../../components/icons/index.js';

/**
 * The ⋮ button of a «عقاراتي» row (Figma 75:736, 18px text/muted). The small menu it opens is
 * not in Figma: the Select menu look (bg/raised, border, radius md, shadow-menu) with links.
 *
 * @param {{ label: string, items: { label: string, to: string }[] }} props
 */
export function RowActionsMenu({ label, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();

  // Close on a click outside the menu or on Escape.
  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current.contains(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={label}
        className="flex rounded-sm p-1 text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-brand"
      >
        <IconKebab />
      </button>
      {isOpen && (
        <ul
          id={menuId}
          className="absolute end-0 top-full z-20 mt-1 flex w-max min-w-44 flex-col rounded-md border border-border bg-raised py-[5px] shadow-menu"
        >
          {items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="block px-3.5 py-2.5 text-[13.5px] leading-[1.72] text-text hover:bg-inset focus-visible:bg-inset focus-visible:outline-none"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
