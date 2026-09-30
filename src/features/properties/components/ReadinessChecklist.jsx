import clsx from 'clsx';
import { IconCountCheck, IconPhotoRemove } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import { MIN_IMAGES } from '../constants.js';

const text = ar.ownerProperty;

/**
 * The three things a Pending or Rejected listing needs before an admin can see it (CLAUDE.md
 * 6.8). Not in Figma: a card from tokens, each line with a success check or a danger cross and
 * «مكتمل» / «ناقص» (so the color is not the only signal).
 *
 * «جاهز» shows only on a Pending listing — a Rejected one still needs «إعادة الإرسال».
 *
 * @param {{
 *   readiness: ReturnType<typeof import('../listingState.js').readinessOf>,
 *   isPending: boolean,
 * }} props
 */
export function ReadinessChecklist({ readiness, isPending }) {
  const items = [
    { label: text.checklist.images(MIN_IMAGES), isDone: readiness.hasEnoughImages },
    { label: text.checklist.main, isDone: readiness.hasMainImage },
    { label: text.checklist.document, isDone: readiness.hasDocument },
  ];

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-raised p-4 xl:px-[21px] xl:py-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[16px] leading-[1.72] font-bold text-text">{text.checklistTitle}</h2>
        <p className="text-[13px] leading-[1.72] text-text-secondary">{text.checklistHint}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5">
            <span
              className={clsx(
                'rounded-full p-[5px]',
                item.isDone ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
              )}
            >
              {item.isDone ? <IconCountCheck /> : <IconPhotoRemove />}
            </span>
            <span className="flex-1 text-[14px] leading-[1.72] text-text">{item.label}</span>
            <span
              className={clsx(
                'text-[12.5px] leading-[1.72] font-semibold',
                item.isDone ? 'text-success' : 'text-danger',
              )}
            >
              {item.isDone ? text.checklistDone : text.checklistMissing}
            </span>
          </li>
        ))}
      </ul>
      {readiness.isReady && isPending && (
        <p className="rounded-md bg-success-soft px-3.5 py-2.5 text-[13px] leading-[1.72] font-semibold text-success">
          {text.checklistReady}
        </p>
      )}
    </section>
  );
}
