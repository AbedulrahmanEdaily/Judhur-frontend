import clsx from 'clsx';

/**
 * Figma "صورة المستخدم / Avatar" (44:769), size «متوسط» (44:765): a 40px brand/subtle circle
 * with the first letter (16/1.65 semibold brand/text), or the photo when there is one.
 * The «كبير» (56) and «صغير» (28) sizes are not built yet.
 *
 * @param {{ name: string, imageUrl?: string, className?: string }} props
 */
export function Avatar({ name, imageUrl, className }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        className={clsx('size-10 shrink-0 rounded-full object-cover', className)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-[16px] leading-[1.65] font-semibold text-brand-text',
        className,
      )}
    >
      {name.trim().charAt(0)}
    </span>
  );
}
