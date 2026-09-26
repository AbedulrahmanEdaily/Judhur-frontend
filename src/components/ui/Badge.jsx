import clsx from 'clsx';

/**
 * Tones from Figma "شارة / Badge". Feature code maps enum values to a tone.
 * Gold is not a tone here — it belongs to `<VerifiedBadge>` only.
 *
 * @typedef {'brand'|'info'|'neutral'|'success'|'warning'|'danger'|'land-a'|'land-b'|'land-c'} BadgeTone
 */
const tones = {
  brand: 'bg-brand-subtle text-brand', // للبيع
  info: 'bg-info-soft text-info', // للإيجار
  neutral: 'bg-inset text-text-secondary', // مباع
  success: 'bg-success-soft text-success', // معتمد
  warning: 'bg-warning-soft text-warning', // قيد المراجعة
  danger: 'bg-danger-soft text-danger', // مرفوض
  'land-a': 'bg-land-a-soft text-land-a',
  'land-b': 'bg-land-b-soft text-land-b',
  'land-c': 'bg-land-c-soft text-land-c',
};

export const badgeBaseClasses =
  'inline-flex items-center gap-1 rounded-full px-3 py-[5px] text-[12px] font-semibold leading-[1.6] whitespace-nowrap';

/** @param {{ tone?: BadgeTone, className?: string, children: import('react').ReactNode }} props */
export function Badge({ tone = 'neutral', className, children }) {
  return <span className={clsx(badgeBaseClasses, tones[tone], className)}>{children}</span>;
}
