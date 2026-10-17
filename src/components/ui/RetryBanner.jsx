import { ar } from '../../locales/ar.js';

/** @param {{ onRetry: () => void }} props */
export function RetryBanner({ onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border bg-warning-soft px-4 py-2.5 text-[13px] leading-[1.72] text-text"
    >
      <span className="flex-1">{ar.errors.refreshFailed}</span>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-sm font-semibold text-brand-text hover:underline focus-visible:outline-2 focus-visible:outline-brand"
      >
        {ar.common.retry}
      </button>
    </div>
  );
}
