import clsx from 'clsx';
import logoLight from '../../assets/logo.svg';
import logoDark from '../../assets/logo-dark.svg';
import { ar } from '../../locales/ar.js';

/**
 * The crest, exported from Figma ("الشعار / ختم جذور"). The Figma colors swap with the theme,
 * so both exports are rendered and the theme class picks one. Minimum size is 24px.
 *
 * @param {{ size?: number, className?: string, decorative?: boolean }} props
 */
export function Logo({ size = 42, className, decorative = false }) {
  const alt = decorative ? '' : ar.app.logoAlt;
  // Lazy: the variant hidden by the theme class is never downloaded.
  const common = { width: size, height: size, alt, draggable: false, loading: 'lazy' };

  return (
    <span className={clsx('inline-flex shrink-0', className)}>
      <img src={logoLight} {...common} className="dark:hidden" />
      <img src={logoDark} {...common} className="hidden dark:block" />
    </span>
  );
}
