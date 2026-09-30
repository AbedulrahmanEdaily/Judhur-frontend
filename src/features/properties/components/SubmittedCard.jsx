import { Link } from 'react-router';
import clsx from 'clsx';
import { IconClock, IconSentCheck } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';

const text = ar.listing;

/**
 * Figma "أضف عقار — تم الإرسال" (95:2482): the check circle, title, text, the review-time pill,
 * the three-dot review path (sent and in review reached), and the two buttons. The pill uses
 * the warning colors: gold is kept for the «موثّق» badge only (DESIGN.md).
 *
 * @param {{ title: string, onAddAnother: () => void }} props
 */
export function SubmittedCard({ title, onAddAnother }) {
  return (
    <section className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-raised px-5 pt-10 pb-9 text-center xl:px-[55px] xl:pt-[47px] xl:pb-[43px]">
      <span className="flex size-[88px] items-center justify-center rounded-full bg-brand-subtle text-brand">
        <IconSentCheck />
      </span>
      <h1 className="text-[22px] leading-[1.5] font-bold text-text xl:text-[28px]">
        {text.sentTitle}
      </h1>
      <p className="max-w-[560px] text-[15px] leading-[1.75] text-text-secondary xl:text-[16px]">
        {text.sentText(title)}
      </p>
      <p className="flex items-center gap-2 rounded-full bg-warning-soft px-4 py-2 text-[14px] leading-[1.75] font-semibold text-warning">
        <IconClock className="shrink-0" />
        {text.sentDuration}
      </p>

      <ol className="flex items-start pt-[26px]">
        {text.sentSteps.map((name, index) => {
          const isReached = index < 2;
          return (
            <li key={name} className="flex items-start">
              {index > 0 && (
                <span aria-hidden="true" className="mt-2 h-0.5 w-16 bg-brand sm:w-[150px]" />
              )}
              <span className="flex w-[76px] flex-col items-center gap-2">
                <span
                  className={clsx(
                    'size-[18px] rounded-full',
                    isReached ? 'bg-brand' : 'border-2 border-border-strong bg-bg',
                  )}
                />
                <span
                  className={clsx(
                    'text-[13px] leading-[1.75] whitespace-nowrap',
                    isReached ? 'font-semibold text-text' : 'text-muted',
                  )}
                >
                  {name}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap justify-center gap-3 pt-2.5">
        <Link
          to="/my-properties"
          className="rounded-md bg-brand px-[26px] py-3.5 text-[16px] leading-[1.75] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {text.viewMine}
        </Link>
        <button
          type="button"
          onClick={onAddAnother}
          className="rounded-md border border-border-strong bg-bg px-[25px] py-[13px] text-[16px] leading-[1.75] font-semibold text-text transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {text.addAnother}
        </button>
      </div>
    </section>
  );
}
