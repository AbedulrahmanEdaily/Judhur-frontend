import clsx from 'clsx';
import { LoaderCircle } from 'lucide-react';
import { ar } from '../../locales/ar.js';

/** @param {{ size?: number, className?: string, label?: string }} props */
export function Spinner({ size = 18, className, label = ar.common.loading }) {
  return (
    <span role="status" className={clsx('inline-flex', className)}>
      <LoaderCircle size={size} className="animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
