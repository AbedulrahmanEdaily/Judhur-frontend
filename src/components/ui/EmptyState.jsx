import clsx from 'clsx';
import { Link } from 'react-router';
import { IconEmptyBox } from '../icons/index.js';

/**
 * Figma "حالة فارغة / Empty State" (45:787): dashed border/subtle on bg/surface, radius lg,
 * 32×48 padding, 14 gap; icon circle brand/subtle p-18 with a 30px icon in brand/text;
 * title 18/1.75 bold; description 13.5/1.75 text/secondary; action button (45:793).
 *
 * @param {{
 *   icon?: import('react').ComponentType<import('react').SVGProps<SVGSVGElement>>,
 *   title: string,
 *   description?: string,
 *   action?: { label: string, to?: string, onClick?: () => void },
 *   className?: string,
 * }} props
 */
export function EmptyState({ icon: Icon = IconEmptyBox, title, description, action, className }) {
  // Figma action button (45:793): brand, 20×11, 14/1.75 semibold.
  const actionClasses =
    'inline-flex items-center justify-center rounded-md bg-brand px-5 py-[11px] text-[14px] leading-[1.75] font-semibold whitespace-nowrap text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

  return (
    <div
      className={clsx(
        'flex flex-col items-center gap-3.5 rounded-lg border border-dashed border-border bg-surface px-[31px] py-[47px] text-center',
        className,
      )}
    >
      <div className="rounded-full bg-brand-subtle p-[18px] text-brand-text">
        <Icon width={30} height={30} />
      </div>
      <h2 className="text-[18px] leading-[1.75] font-bold text-text">{title}</h2>
      {description && (
        <p className="text-[13.5px] leading-[1.75] text-text-secondary">{description}</p>
      )}
      {action &&
        (action.to ? (
          <Link to={action.to} className={actionClasses}>
            {action.label}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className={actionClasses}>
            {action.label}
          </button>
        ))}
    </div>
  );
}
