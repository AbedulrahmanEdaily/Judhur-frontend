import clsx from 'clsx';
import { ar } from '../../locales/ar.js';

/**
 * Loading indicator. Figma has no spinner, so this is a plain ring in `currentColor`
 * (listed under "Not in Figma" in DESIGN.md).
 *
 * @param {{ size?: number, className?: string, label?: string }} props
 */
export function Spinner({ size = 18, className, label = ar.common.loading }) {
  return (
    <span role="status" className={clsx('inline-flex', className)}>
      <span
        aria-hidden="true"
        className="animate-spin rounded-full border-2 border-current border-e-transparent"
        style={{ width: size, height: size }}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
