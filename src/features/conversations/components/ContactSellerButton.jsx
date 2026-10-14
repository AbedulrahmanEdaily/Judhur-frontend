import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import clsx from 'clsx';
import { IconChat } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import { loginPathFor } from '../../../routes/redirect.js';
import { selectIsAuthenticated } from '../../auth/authSlice.js';
import { ContactSellerDialog } from './ContactSellerDialog.jsx';

const text = ar.conversations;

const variantClasses = {
  // Desktop price card «راسل البائع داخل جذور» (67:1214): brand, 14.5/1.78, 17px chat icon.
  card: 'w-full py-[13px] text-[14.5px] leading-[1.78]',
  // Mobile action bar (83:718): brand, 15/1.72.
  bar: 'py-3.5 text-[15px] leading-[1.72]',
};

/**
 * «تواصل مع البائع». The caller shows it only when `canContactSeller` allows: a guest gets a
 * login link that comes back to the listing; a user opens the first-message dialog.
 *
 * @param {{
 *   property: import('../../../api/types.js').PropertyDetails,
 *   variant?: 'card' | 'bar',
 *   className?: string,
 * }} props
 */
export function ContactSellerButton({ property, variant = 'card', className }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const classes = clsx(
    'flex items-center justify-center gap-2 rounded-md bg-brand font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
    variantClasses[variant],
    className,
  );

  if (!isAuthenticated) {
    return (
      <Link to={loginPathFor(location)} title={text.loginToContact} className={classes}>
        <IconChat width={17} height={17} className="shrink-0" />
        {text.contact}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        className={classes}
      >
        <IconChat width={17} height={17} className="shrink-0" />
        {text.contact}
      </button>
      {isOpen && <ContactSellerDialog property={property} onClose={() => setIsOpen(false)} />}
    </>
  );
}
