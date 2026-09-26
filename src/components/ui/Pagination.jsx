import clsx from 'clsx';
import { ar } from '../../locales/ar.js';

const itemClasses =
  'inline-flex min-w-10 items-center justify-center rounded-[10px] px-3.5 py-[9px] text-[13.5px] leading-[1.75] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';
const idleClasses = 'border border-border bg-surface text-text hover:bg-inset';
const currentClasses = 'bg-brand font-semibold text-inverse';

/**
 * Page numbers to render, with `null` for a gap: 1 … 4 5 6 … 20
 * @param {number} page
 * @param {number} totalPages
 * @returns {(number|null)[]}
 */
function pageWindow(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = Math.max(2, Math.min(page - 1, totalPages - 4));
  const end = Math.min(totalPages - 1, Math.max(page + 1, 5));
  const pages = [1];
  if (start > 2) pages.push(null);
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < totalPages - 1) pages.push(null);
  pages.push(totalPages);
  return pages;
}

/**
 * Figma "ترقيم الصفحات / Pagination" — RTL: page 1 on the right, "التالي" on the left.
 *
 * @param {{ page: number, totalPages: number, onPageChange: (page: number) => void, className?: string }} props
 */
export function Pagination({ page, totalPages, onPageChange, className }) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={ar.pagination.label} className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={clsx(
              itemClasses,
              idleClasses,
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            {ar.pagination.previous}
          </button>
        </li>
        {pageWindow(page, totalPages).map((p, index) =>
          p === null ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={ar.pagination.page(p)}
                className={clsx(itemClasses, p === page ? currentClasses : idleClasses)}
              >
                {p}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={clsx(
              itemClasses,
              idleClasses,
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            {ar.pagination.next}
          </button>
        </li>
      </ul>
    </nav>
  );
}
