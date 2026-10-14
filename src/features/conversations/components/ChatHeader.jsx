import { Link } from 'react-router';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { ar } from '../../../locales/ar.js';
import { PropertyPhoto } from '../../properties/components/PropertyPhoto.jsx';

const text = ar.conversations;

/**
 * The top of a chat. From 1280px up, Figma "رأس" (76:1086): bg/surface, 20×14, the avatar 40,
 * the name 15 bold and «بخصوص: …» 12 muted (a link to the listing). Below 1280px, the mobile
 * listing card (84:530): photo, title and «افتح الإعلان»; the name is in the page's top bar.
 * A hidden listing says «الإعلان لم يعد متاحًا» instead of linking.
 *
 * @param {{ conversation: import('../../../api/types.js').ConversationDetails }} props
 */
export function ChatHeader({ conversation }) {
  const { property, otherParty } = conversation;
  let name = text.deletedUser;
  if (otherParty) name = otherParty.fullName;

  let about = <span>{text.about(property.title)}</span>;
  if (property.isAvailable) {
    about = (
      <Link
        to={`/properties/${property.id}`}
        className="rounded-sm hover:text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
      >
        {text.about(property.title)}
      </Link>
    );
  }

  return (
    <>
      <div className="hidden items-center gap-3 border-b border-border bg-surface px-5 py-3.5 xl:flex">
        <Avatar name={name} imageUrl={otherParty?.profileImageUrl} />
        <div className="flex min-w-0 flex-col gap-px leading-[1.72]">
          <h2 className="truncate text-[15px] font-bold text-text">{name}</h2>
          <p className="truncate text-[12px] text-muted">
            {about}
            {!property.isAvailable && ` — ${text.unavailable}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-border bg-raised px-4 py-3 xl:hidden">
        <span className="size-11 shrink-0 overflow-hidden rounded-[10px]">
          <PropertyPhoto src={property.mainImageUrl} />
        </span>
        <div className="flex min-w-0 flex-col leading-[1.72]">
          <p className="truncate text-[13.5px] font-semibold text-text">{property.title}</p>
          {property.isAvailable && (
            <Link
              to={`/properties/${property.id}`}
              className="self-start rounded-sm text-[12px] font-semibold text-brand-text focus-visible:outline-2 focus-visible:outline-brand"
            >
              {text.openListing}
            </Link>
          )}
          {!property.isAvailable && (
            <p className="text-[12px] font-semibold text-warning">{text.unavailable}</p>
          )}
        </div>
      </div>
    </>
  );
}
