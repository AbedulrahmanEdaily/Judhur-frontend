import clsx from 'clsx';
import { formatTime } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';

const text = ar.conversations;

/**
 * Figma "فقاعة محادثة / Chat Bubble" (47:799): mine at the end on brand/solid with text/inverse
 * and a 4px bottom-end corner; theirs at the start on bg/surface with a border/subtle line and a
 * 4px bottom-start corner. 300 wide at most, 16×12 padding, text 14/1.75, time 10.5. The ✓ (sent)
 * / ✓✓ (read) on mine is not in Figma.
 *
 * @param {{ message: import('../../../api/types.js').Message }} props
 */
export function ChatBubble({ message }) {
  const mine = message.isMine;

  let readMark = null;
  if (mine) {
    let mark = '✓';
    let label = text.sentMark;
    if (message.readAtUtc) {
      mark = '✓✓';
      label = text.readMark;
    }
    readMark = (
      <span aria-label={label} title={label} className="text-[11px] tracking-[-0.2em]">
        {mark}
      </span>
    );
  }

  return (
    <li className={clsx('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'flex max-w-[min(300px,80%)] flex-col gap-1.5 rounded-lg px-4 pt-3 pb-2.5',
          mine && 'rounded-ee-[4px] bg-brand text-inverse',
          !mine && 'rounded-es-[4px] border border-border bg-surface text-text',
        )}
      >
        <p className="text-[14px] leading-[1.75] break-words whitespace-pre-wrap">
          {message.content}
        </p>
        <p
          className={clsx(
            'flex items-center gap-1.5 text-[10.5px] leading-[1.75]',
            mine ? 'text-inverse/85' : 'text-muted',
          )}
        >
          <time dateTime={message.sentAtUtc}>{formatTime(message.sentAtUtc)}</time>
          {readMark}
        </p>
      </div>
    </li>
  );
}
