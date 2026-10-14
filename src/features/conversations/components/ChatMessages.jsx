import { useLayoutEffect, useRef } from 'react';
import { Spinner } from '../../../components/ui/Spinner.jsx';
import { formatDate } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import { ChatBubble } from './ChatBubble.jsx';

const text = ar.conversations;

// Older messages load when the list is scrolled this close to its top.
const LOAD_OLDER_AT_PX = 80;
// A new message scrolls the list down only if the user was this close to the bottom.
const STICK_TO_BOTTOM_PX = 120;

/** «اليوم», «أمس», or the date — the day pill (76:1095). */
function dayLabel(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return ar.notifications.today;
  if (date.toDateString() === yesterday.toDateString()) return ar.notifications.yesterday;
  return formatDate(date);
}

/**
 * Figma "الرسائل" (76:1094): the scrolling message list, oldest at the top, 22px padding and
 * 14 between bubbles, with a day pill (bg/inset, 11.5 semibold muted) when the day changes.
 * Opening a chat starts at the bottom; a new message scrolls down when the user was already
 * there (always for mine). Near the top the older page loads, and the view stays on the same
 * message instead of jumping.
 *
 * @param {{
 *   messages: import('../../../api/types.js').Message[],
 *   hasOlder: boolean,
 *   isLoadingOlder: boolean,
 *   onLoadOlder: () => void,
 * }} props
 */
export function ChatMessages({ messages, hasOlder, isLoadingOlder, onLoadOlder }) {
  const listRef = useRef(null);
  const firstIdRef = useRef(null);
  const lastIdRef = useRef(null);
  const atBottomRef = useRef(true);
  const restoreRef = useRef(null);

  let firstId = null;
  let lastId = null;
  let lastIsMine = false;
  if (messages.length > 0) {
    firstId = messages[0].id;
    lastId = messages[messages.length - 1].id;
    lastIsMine = messages[messages.length - 1].isMine;
  }

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || lastId === null) return;
    if (restoreRef.current && firstId !== firstIdRef.current) {
      // Older messages were added above: keep the same message under the user's eyes.
      list.scrollTop = list.scrollHeight - restoreRef.current.height + restoreRef.current.top;
      restoreRef.current = null;
    } else if (lastId !== lastIdRef.current) {
      const isFirstPaint = lastIdRef.current === null;
      if (isFirstPaint || atBottomRef.current || lastIsMine) list.scrollTop = list.scrollHeight;
    }
    firstIdRef.current = firstId;
    lastIdRef.current = lastId;
  }, [firstId, lastId, lastIsMine]);

  function loadOlder() {
    const list = listRef.current;
    restoreRef.current = { height: list.scrollHeight, top: list.scrollTop };
    onLoadOlder();
  }

  function handleScroll() {
    const list = listRef.current;
    const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
    atBottomRef.current = distanceFromBottom < STICK_TO_BOTTOM_PX;
    if (list.scrollTop < LOAD_OLDER_AT_PX && hasOlder && !isLoadingOlder) loadOlder();
  }

  const rows = [];
  let previousDay = null;
  for (const message of messages) {
    const date = new Date(message.sentAtUtc);
    const day = date.toDateString();
    if (day !== previousDay) {
      rows.push(
        <li key={`day-${day}`} className="flex justify-center">
          <span className="rounded-full bg-inset px-3 py-[5px] text-[11.5px] leading-[1.72] font-semibold text-muted">
            {dayLabel(date)}
          </span>
        </li>,
      );
      previousDay = day;
    }
    rows.push(<ChatBubble key={message.id} message={message} />);
  }

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="min-h-0 flex-1 overflow-y-auto px-4 py-4 xl:px-[22px] xl:py-[22px]"
    >
      <div className="flex justify-center pb-3.5">
        {hasOlder && !isLoadingOlder && (
          <button
            type="button"
            onClick={loadOlder}
            className="rounded-full border border-border bg-raised px-3.5 py-1 text-[12px] leading-[1.72] font-semibold text-text-secondary transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-brand"
          >
            {text.loadOlder}
          </button>
        )}
        {isLoadingOlder && (
          <span role="status" className="flex items-center gap-2 text-[12px] text-muted">
            <Spinner size={14} />
            {text.loadingOlder}
          </span>
        )}
        {!hasOlder && messages.length > 0 && (
          <span className="text-[11.5px] leading-[1.72] text-muted">{text.chatStart}</span>
        )}
      </div>
      <ol aria-label={text.messagesLabel} aria-live="polite" className="flex flex-col gap-3.5">
        {rows}
      </ol>
    </div>
  );
}
