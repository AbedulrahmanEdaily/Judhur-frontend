import { Avatar } from '../../../components/ui/Avatar.jsx';
import { formatPrice } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { PAYMENT_TYPE_LABELS } from '../constants.js';
import { PhoneButton } from './PhoneButton.jsx';

const text = ar.property;

/**
 * Figma price + seller card (67:1195): asking price 34 bold brand/text with the price per m² and
 * payment type, then the seller (Avatar 40 + name 15 bold) and the phone button. The API has no
 * seller rating or join date, and no messaging, so those parts of the frame are left out.
 *
 * @param {{ property: import('../../../api/types.js').PropertyDetails }} props
 */
export function PriceCard({ property }) {
  const pricePerSquareMeter = formatPrice(property.price / property.area);

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-raised p-[23px]">
      <div className="flex flex-col gap-1 leading-[1.78]">
        <p className="text-[12.5px] text-muted">{text.askingPrice}</p>
        <p dir="ltr" className="self-start text-[34px] font-bold text-brand-text">
          {formatPrice(property.price)}
        </p>
        <p className="text-[13px] whitespace-pre-wrap text-text-secondary">
          {`${text.perSquareMeter(pricePerSquareMeter)}  ·  ${PAYMENT_TYPE_LABELS[property.paymentType]}`}
        </p>
      </div>

      {property.user && (
        <>
          <div className="h-px bg-border" />
          <div className="flex items-center gap-3">
            <Avatar name={property.user.fullName} imageUrl={property.user.profileImageUrl} />
            <p className="text-[15px] leading-[1.78] font-bold text-text">
              {property.user.fullName}
            </p>
          </div>
          <PhoneButton phoneNumber={property.user.phoneNumber} />
        </>
      )}
    </section>
  );
}
