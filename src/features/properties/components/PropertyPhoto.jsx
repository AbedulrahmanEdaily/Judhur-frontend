import clsx from 'clsx';
import morningPhoto from '../../../assets/photos/property-morning.svg';
import noonPhoto from '../../../assets/photos/property-noon.svg';
import sunsetPhoto from '../../../assets/photos/property-sunset.svg';

// Figma "صورة عقار / Property Photo" (89:843): صباح 89:744 · ظهيرة 89:777 · غروب 89:810.
const placeholders = { morning: morningPhoto, noon: noonPhoto, sunset: sunsetPhoto };

/**
 * A listing photo filling its box. Without `src` it shows the Figma Property Photo — it
 * stretches like the Figma instances do.
 *
 * @param {{
 *   src?: string,
 *   alt?: string,
 *   placeholder?: 'morning'|'noon'|'sunset',
 *   className?: string,
 * }} props
 */
export function PropertyPhoto({ src, alt = '', placeholder = 'morning', className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={clsx('size-full object-cover', className)}
      />
    );
  }
  return <img src={placeholders[placeholder]} alt="" className={clsx('size-full', className)} />;
}
