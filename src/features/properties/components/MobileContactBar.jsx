import { useSelector } from 'react-redux';
import { formatPrice } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { selectCurrentUser, selectIsAuthenticated } from '../../auth/authSlice.js';
import { ContactSellerButton } from '../../conversations/components/ContactSellerButton.jsx';
import { canContactSeller } from '../../conversations/contactRules.js';
import { PhoneButton } from './PhoneButton.jsx';

/**
 * Figma mobile action bar "إجراء" (83:717): the price at the start, the brand button filling the
 * rest — «تواصل مع البائع». The owner and admins get the phone button there instead.
 *
 * @param {{ property: import('../../../api/types.js').PropertyDetails }} props
 */
export function MobileContactBar({ property }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const canContact = canContactSeller(isAuthenticated, user, property);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2.5 border border-border bg-raised px-[15px] pt-[11px] pb-[19px] xl:hidden">
      <div className="flex flex-col leading-[1.72] whitespace-nowrap">
        <span className="text-[11px] text-muted">{ar.property.price}</span>
        <span dir="ltr" className="self-start text-[18px] font-bold text-brand-text">
          {formatPrice(property.price)}
        </span>
      </div>
      {canContact && (
        <ContactSellerButton property={property} variant="bar" className="min-w-0 flex-1" />
      )}
      {!canContact && (
        <PhoneButton
          phoneNumber={property.user?.phoneNumber}
          variant="primary"
          className="min-w-0 flex-1"
        />
      )}
    </div>
  );
}
