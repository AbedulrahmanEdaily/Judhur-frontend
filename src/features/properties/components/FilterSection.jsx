import { useId, useState } from 'react';
import clsx from 'clsx';
import { IconSelectChevron } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';

/**
 * One section of the filters panel (Figma 52:870…): 20×18 padding, 12 gap, a title row with the
 * 16px chevron at the end. The chevron folds the section (the folded look is not in Figma).
 *
 * @param {{ title: string, children: import('react').ReactNode }} props
 */
export function FilterSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(true);
  const contentId = useId();

  return (
    <section className="flex flex-col gap-3 px-5 py-[18px]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        aria-label={ar.search.toggleSection(title)}
        className="flex items-center rounded-sm text-start focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span className="flex-1 text-[14px] leading-[1.7] font-semibold text-text">{title}</span>
        <IconSelectChevron
          className={clsx('text-muted transition-transform', !isOpen && 'rotate-180')}
        />
      </button>
      <div id={contentId} hidden={!isOpen} className="flex flex-col gap-3">
        {children}
      </div>
    </section>
  );
}
