import { Fragment } from 'react';
import clsx from 'clsx';
import { IconStepCheck } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';

const text = ar.listing;

/**
 * Desktop: Figma "خطوات الويزارد / Stepper" (46:789) in its card (77:1215) — 34px circles
 * (done: brand with the check; current: brand with the number; next: bg/inset with a
 * border/subtle ring and the number in text/muted), 2px lines (brand up to the current step),
 * labels 13 (semibold text/primary on the current step, else text/muted).
 * Mobile: the four 4px bars of 84:675 with 10.5 labels (brand/text up to the current step).
 * Finished steps can be clicked to go back.
 *
 * @param {{ current: number, onStepClick: (step: number) => void }} props
 */
export function ListingStepper({ current, onStepClick }) {
  return (
    <nav aria-label={text.stepsLabel}>
      <ol className="hidden items-center rounded-lg border border-border bg-raised px-[23px] py-[25px] xl:flex">
        {text.steps.map((name, index) => {
          const step = index + 1;
          const isDone = step < current;
          const isCurrent = step === current;

          let circle = (
            <span className="flex size-[34px] items-center justify-center rounded-full border border-border bg-inset text-[14px] leading-[1.72] font-semibold text-muted">
              {step}
            </span>
          );
          if (isCurrent) {
            circle = (
              <span className="flex size-[34px] items-center justify-center rounded-full bg-brand text-[14px] leading-[1.72] font-semibold text-inverse">
                {step}
              </span>
            );
          }
          if (isDone) {
            circle = (
              <span className="flex size-[34px] items-center justify-center rounded-full bg-brand text-inverse">
                <IconStepCheck />
              </span>
            );
          }

          const label = (
            <span
              className={clsx(
                'text-[13px] leading-[1.72] whitespace-nowrap',
                isCurrent ? 'font-semibold text-text' : 'text-muted',
              )}
            >
              {name}
            </span>
          );

          return (
            <Fragment key={name}>
              {index > 0 && (
                <li
                  aria-hidden="true"
                  className={clsx(
                    'mt-4 h-0.5 flex-1 self-start',
                    step <= current ? 'bg-brand' : 'bg-border',
                  )}
                />
              )}
              <li aria-current={isCurrent ? 'step' : undefined}>
                {isDone && (
                  <button
                    type="button"
                    onClick={() => onStepClick(step)}
                    className="flex flex-col items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {circle}
                    {label}
                  </button>
                )}
                {!isDone && (
                  <div className="flex flex-col items-center gap-2">
                    {circle}
                    {label}
                  </div>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>

      <ol className="flex gap-1.5 xl:hidden">
        {text.steps.map((name, index) => {
          const step = index + 1;
          const isReached = step <= current;
          return (
            <li
              key={name}
              aria-current={step === current ? 'step' : undefined}
              className="flex flex-1 flex-col items-center gap-[5px]"
            >
              <span
                className={clsx('h-1 w-full rounded-full', isReached ? 'bg-brand' : 'bg-border')}
              />
              <span
                className={clsx(
                  'text-[10.5px] leading-[1.72]',
                  isReached ? 'font-semibold text-brand-text' : 'text-muted',
                )}
              >
                {name}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
