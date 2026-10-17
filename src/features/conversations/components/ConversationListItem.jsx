import { NavLink } from 'react-router';
import clsx from 'clsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { formatNumber, formatRelativeTime } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { PropertyPhoto } from '../../properties/components/PropertyPhoto.jsx';

const text = ar.conversations;

/**
 * One conversation of the list — Figma row (76:1130): 18×13, the avatar 38 at the start, the
 * name 14 semibold with the time 11 muted at the end, the preview 12 muted; brand/subtle when
 * open. Not in Figma: the listing line (photo 22 + title, or «الإعلان لم يعد متاحًا»), the role
 * chip, «أنت: » before my own last message, and the unread count pill in place of the dot.
 *
 * @param {{ conversation: import('../../../api/types.js').ConversationSummary, search?: string }} props
 */
export function ConversationListItem({ conversation, search = '' }) {
  const { property, otherParty } = conversation;
  const isUnread = conversation.unreadCount > 0;
  const role = text.roles[conversation.myRole];

  let name = text.deletedUser;
  if (otherParty) name = otherParty.fullName;

  let preview = text.noMessagesYet;
  if (conversation.lastMessagePreview) {
    preview = conversation.lastMessagePreview;
    if (conversation.lastMessageIsMine) preview = `${text.you}${preview}`;
  }

  return (
    <NavLink
      to={{ pathname: `/messages/${conversation.id}`, search }}
      className={({ isActive }) =>
        clsx(
          'flex items-start gap-[11px] px-[18px] py-[13px] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand',
          isActive ? 'bg-brand-subtle' : 'hover:bg-inset',
        )
      }
    >
      <Avatar
        name={name}
        imageUrl={otherParty?.profileImageUrl}
        sizeClassName="size-[38px] text-[15px]"
        className="mt-0.5"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span
            className={clsx(
              'min-w-0 flex-1 truncate text-[14px] leading-[1.72] text-text',
              isUnread ? 'font-bold' : 'font-semibold',
            )}
          >
            {name}
          </span>
          {conversation.lastMessageAtUtc && (
            <time
              dateTime={conversation.lastMessageAtUtc}
              className="shrink-0 text-[11px] leading-[1.72] text-muted"
            >
              {formatRelativeTime(conversation.lastMessageAtUtc)}
            </time>
          )}
        </span>
        <span className="flex items-center gap-2">
          <span
            className={clsx(
              'min-w-0 flex-1 truncate text-[12px] leading-[1.72]',
              isUnread ? 'font-semibold text-text-secondary' : 'text-muted',
            )}
          >
            {preview}
          </span>
          {isUnread && (
            <span className="shrink-0 rounded-full bg-brand px-1.5 text-[10.5px] leading-[18px] font-semibold text-inverse">
              <span aria-hidden="true">{formatNumber(conversation.unreadCount)}</span>
              <span className="sr-only">
                {text.unreadLabel(formatNumber(conversation.unreadCount))}
              </span>
            </span>
          )}
        </span>
        <span className="mt-1 flex items-center gap-1.5">
          <span className="size-[22px] shrink-0 overflow-hidden rounded-[6px]">
            <PropertyPhoto src={property.mainImageUrl} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[11.5px] leading-[1.72] text-text-secondary">
            {property.title}
          </span>
          <span
            title={text.roleLabel(role)}
            className="shrink-0 rounded-full bg-inset px-2 text-[10.5px] leading-[1.72] font-semibold text-text-secondary"
          >
            {role}
          </span>
        </span>
        {!property.isAvailable && (
          <span className="text-[11px] leading-[1.72] font-semibold text-warning">
            {text.unavailable}
          </span>
        )}
      </span>
    </NavLink>
  );
}
