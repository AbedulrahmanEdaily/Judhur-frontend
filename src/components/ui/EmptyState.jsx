import clsx from 'clsx';
import { Inbox } from 'lucide-react';

/**
 * Figma "حالة فارغة / Empty State": a friendly message plus a next action.
 *
 * @param {{
 *   icon?: import('react').ComponentType<{ size?: number, className?: string, 'aria-hidden'?: boolean | 'true' }>,
 *   title: string,
 *   description?: string,
 *   action?: import('react').ReactNode,
 *   className?: string,
 * }} props
 */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center gap-3.5 rounded-lg border border-dashed border-border bg-surface px-8 py-12 text-center',
        className,
      )}
    >
      <div className="rounded-full bg-brand-subtle p-[18px] text-brand">
        <Icon size={30} aria-hidden="true" />
      </div>
      <h2 className="text-[18px] leading-[1.75] font-bold text-text">{title}</h2>
      {description && (
        <p className="max-w-md text-[13.5px] leading-[1.75] text-text-secondary">{description}</p>
      )}
      {action}
    </div>
  );
}
