import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import clsx from 'clsx';
import { IconPhone } from '../../../components/icons/index.js';
import { selectIsAuthenticated } from '../../auth/authSlice.js';
import { loginPathFor } from '../../../routes/redirect.js';
import { ar } from '../../../locales/ar.js';

const variantClasses = {
  // Desktop price card (67:1218): bg/surface, border/strong, 14.5/1.78.
  secondary:
    'border border-border-strong bg-surface py-[13px] text-[14.5px] leading-[1.78] text-text hover:bg-inset',
  // Mobile action bar (83:718): brand, 15/1.72.
  primary: 'bg-brand py-3.5 text-[15px] leading-[1.72] text-inverse hover:bg-brand-hover',
};

/**
 * The seller's phone. The API sends `phoneNumber` only to signed-in users: they tap
 * «اطلب رقم الهاتف» to show it as a call link; guests get a login link that comes back here.
 * Nothing shows for a signed-in user when the seller has no phone.
 *
 * @param {{ phoneNumber?: string, variant?: 'secondary'|'primary', className?: string }} props
 */
export function PhoneButton({ phoneNumber, variant = 'secondary', className }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();
  const [isRevealed, setIsRevealed] = useState(false);

  const classes = clsx(
    'flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    variantClasses[variant],
    className,
  );

  // Figma draws the phone icon in text/secondary on the light button.
  let iconClass;
  if (variant === 'secondary') iconClass = 'text-text-secondary';

  if (!phoneNumber && !isAuthenticated) {
    return (
      <Link to={loginPathFor(location)} className={classes}>
        {ar.property.loginForPhone}
      </Link>
    );
  }
  if (!phoneNumber) return null;

  if (isRevealed) {
    return (
      <a href={`tel:${phoneNumber}`} className={classes}>
        <IconPhone className={iconClass} />
        <span dir="ltr">{phoneNumber}</span>
      </a>
    );
  }
  return (
    <button type="button" onClick={() => setIsRevealed(true)} className={classes}>
      <IconPhone className={iconClass} />
      {ar.property.requestPhone}
    </button>
  );
}
