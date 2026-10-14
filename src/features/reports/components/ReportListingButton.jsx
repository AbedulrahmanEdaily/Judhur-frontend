import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import clsx from 'clsx';
import { IconFlag16 } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import { loginPathFor } from '../../../routes/redirect.js';
import { selectCurrentUser, selectIsAuthenticated } from '../../auth/authSlice.js';
import { ReportListingDialog } from './ReportListingDialog.jsx';

const text = ar.reports;

// header: Figma «إبلاغ» (65:1169) — the «مشاركة» look: bg/surface, border/subtle, radius md,
// 14×9, 13 semibold text/secondary, 16px flag in text/muted.
// block: the same box, full width with the long label, under the safety tips below 1280px.
const variantClasses = {
  header: 'flex items-center gap-[7px] px-[13px] py-2',
  block: 'flex w-full items-center justify-center gap-[7px] px-[13px] py-2.5',
};

const baseClasses =
  'rounded-md border border-border bg-surface text-[13px] leading-[1.72] font-semibold text-text-secondary transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/**
 * «إبلاغ عن الإعلان» on the public details page (the project guide 6.15). A signed-in user who
 * does not own the listing opens the report dialog; a guest goes to login and comes back here;
 * admins and the owner get nothing.
 *
 * @param {{
 *   property: import('../../../api/types.js').PropertyDetails,
 *   variant?: 'header' | 'block',
 * }} props
 */
export function ReportListingButton({ property, variant = 'header' }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  let label = text.reportListing;
  if (variant === 'header') label = text.report;
  const classes = clsx(baseClasses, variantClasses[variant]);

  if (!isAuthenticated) {
    return (
      <Link
        to={loginPathFor(location)}
        aria-label={text.loginToReport}
        title={text.loginToReport}
        className={classes}
      >
        <IconFlag16 className="shrink-0 text-muted" />
        {label}
      </Link>
    );
  }

  // Only users report (admins never do), and never their own listing.
  const isUser = user?.roles.includes('User') && !user.roles.includes('Admin');
  const isOwner = property.user?.id === user?.id;
  if (!isUser || isOwner) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={text.reportListing}
        aria-haspopup="dialog"
        className={classes}
      >
        <IconFlag16 className="shrink-0 text-muted" />
        {label}
      </button>
      {isOpen && <ReportListingDialog propertyId={property.id} onClose={() => setIsOpen(false)} />}
    </>
  );
}
