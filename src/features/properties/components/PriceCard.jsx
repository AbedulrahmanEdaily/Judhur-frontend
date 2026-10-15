import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { StarRating } from '../../../components/ui/StarRating.jsx';
import { formatNumber, formatPrice, formatRating } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { selectCurrentUser, selectIsAuthenticated } from '../../auth/authSlice.js';
import { ContactSellerButton } from '../../conversations/components/ContactSellerButton.jsx';
import { canContactSeller } from '../../conversations/contactRules.js';
import { PAYMENT_TYPE_LABELS } from '../constants.js';
import { PhoneButton } from './PhoneButton.jsx';

const text = ar.property;

/** What the rating link says to a screen reader: the reviews of this seller, and the rating. */
function sellerRatingLabel(property) {
  const rating = property.sellerRating;
  let summary = ar.reviews.noReviews;
  if (rating?.reviewsCount > 0) {
    summary = `${ar.reviews.ratingLabel(formatRating(rating.averageRating ?? 0))} ${ar.reviews.countLabel(formatNumber(rating.reviewsCount))}`;
  }
  return `${ar.reviews.sellerReviewsLink(property.user.fullName)}، ${summary}`;
}

/**
 * Figma price + seller card (67:1195): asking price 34 bold brand/text with the price per m² and
 * payment type, then the seller (Avatar 40 + name 15 bold, linking to the seller page) with the
 * rating under the name (67:1205 — five 13px stars where Figma has one, the average 12.5
 * semibold, «(N تقييم)» 11.5 muted; «لا توجد تقييمات بعد» without reviews), linking to the
 * seller's reviews; then «تواصل مع البائع» (67:1214, not for the owner or admins) and the
 * phone button. Figma's «عضو منذ» in that line is not in the details API.
 *
 * @param {{ property: import('../../../api/types.js').PropertyDetails }} props
 */
export function PriceCard({ property }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
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
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <Link
                to={`/sellers/${property.user.id}`}
                aria-label={text.sellerPage(property.user.fullName)}
                className="rounded-sm text-[15px] leading-[1.78] font-bold text-text hover:text-brand-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {property.user.fullName}
              </Link>
              <Link
                to={`/sellers/${property.user.id}#reviews`}
                aria-label={sellerRatingLabel(property)}
                className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <StarRating
                  value={property.sellerRating?.averageRating}
                  count={property.sellerRating?.reviewsCount ?? 0}
                  showValue
                />
              </Link>
            </div>
          </div>
          {canContactSeller(isAuthenticated, user, property) && (
            <ContactSellerButton property={property} />
          )}
          <PhoneButton phoneNumber={property.user.phoneNumber} />
        </>
      )}
    </section>
  );
}
