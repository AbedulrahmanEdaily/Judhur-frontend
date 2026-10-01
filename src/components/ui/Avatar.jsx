import clsx from 'clsx';

/**
 * Figma "صورة المستخدم / Avatar" (44:769): a brand/subtle circle with the first letter
 * (semibold brand/text), or the photo when there is one. The default is the «متوسط» size
 * (44:765): 40px with a 16px letter. Other places pass their own `sizeClassName` (box and
 * letter size): the navbar 38, the profile photo 68 and the seller page 92.
 *
 * @param {{ name: string, imageUrl?: string | null, sizeClassName?: string, className?: string }} props
 */
export function Avatar({ name, imageUrl, sizeClassName = 'size-10 text-[16px]', className }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        className={clsx('shrink-0 rounded-full object-cover', sizeClassName, className)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full bg-brand-subtle leading-[1.65] font-semibold text-brand-text',
        sizeClassName,
        className,
      )}
    >
      {name.trim().charAt(0)}
    </span>
  );
}
