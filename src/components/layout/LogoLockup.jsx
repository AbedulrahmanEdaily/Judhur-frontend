import { Link } from 'react-router';
import { Logo } from './Logo.jsx';
import { ar } from '../../locales/ar.js';

/** Crest + wordmark linking home (Figma navbar "الشعار"). */
export function LogoLockup({ size = 42 }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Logo size={size} decorative />
      <span className="text-[24px] leading-[1.65] font-bold text-brand-text">{ar.app.name}</span>
    </Link>
  );
}
