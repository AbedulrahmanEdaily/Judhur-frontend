import { IconPin } from '../../../components/icons/index.js';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { formatMonthYear, formatNumber } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';

const text = ar.sellers;

/**
 * Figma «ترويسة» of the seller page (73:1443): bg/canvas, 100px sides, 34 top / 30 bottom; the
 * 92px photo with a 2px brand ring, the name 27 bold, then a muted 13 line. The API has no
 * rating, verified seller or messaging, so «4.8 (32 تقييم)», «موثّق» and «راسل البائع» are
 * left out: the listings count takes the rating's place, then the city (13.5 secondary with the
 * 14px pin) and «عضو منذ …». The bio under it is not in Figma.
 *
 * @param {{ seller: import('../../../api/types.js').SellerProfile }} props
 */
export function SellerHeader({ seller }) {
  return (
    <header className="flex items-center gap-4 bg-bg px-4 pt-5 pb-5 xl:gap-[22px] xl:px-[100px] xl:pt-[34px] xl:pb-[30px]">
      <Avatar
        name={seller.fullName}
        imageUrl={seller.profileImageUrl}
        sizeClassName="size-[68px] text-[26px] xl:size-[92px] xl:text-[34px]"
        className="ring-2 ring-brand"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
        <h1 className="text-[21px] leading-[1.74] font-bold text-text xl:text-[27px]">
          {seller.fullName}
        </h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-[1.74] text-muted">
          <span className="font-semibold text-text">
            {text.listingsCount(formatNumber(seller.activeListingsCount))}
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-[5px] text-[13.5px] text-text-secondary">
            <IconPin width={14} height={14} className="shrink-0 text-muted" />
            {seller.city}
          </span>
          <span aria-hidden="true">·</span>
          <span>{text.memberSince(formatMonthYear(seller.memberSinceUtc))}</span>
        </p>
        {seller.bio && (
          <p className="max-w-[720px] text-[14px] leading-[1.75] whitespace-pre-line text-text-secondary">
            {seller.bio}
          </p>
        )}
      </div>
    </header>
  );
}
