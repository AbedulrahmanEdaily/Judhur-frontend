import clsx from 'clsx';

/** Loading placeholder — size and shape come from `className`. */
export function Skeleton({ className }) {
  return (
    <div aria-hidden="true" className={clsx('animate-pulse rounded-md bg-border', className)} />
  );
}
