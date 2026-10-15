import { useState } from 'react';
import clsx from 'clsx';
import { formatRating } from '../../lib/format.js';
import { ar } from '../../locales/ar.js';
import { RatingStar } from './RatingStar.jsx';
import { STAR_POSITIONS, starFill } from './starFill.js';

const text = ar.reviews;
const MIN = 0.5;
const MAX = 5;
const STEP = 0.5;
const STAR_SIZE = 30;

/** The rating a key asks for, or null for any other key. Stars fill from the start side. */
function ratingForKey(key, current, isRtl) {
  let increaseKey = 'ArrowRight';
  let decreaseKey = 'ArrowLeft';
  if (isRtl) {
    increaseKey = 'ArrowLeft';
    decreaseKey = 'ArrowRight';
  }
  if (key === 'ArrowUp' || key === increaseKey) return Math.min(MAX, current + STEP);
  if (key === 'ArrowDown' || key === decreaseKey) return Math.max(MIN, current - STEP);
  if (key === 'Home') return MIN;
  if (key === 'End') return MAX;
  if (key >= '1' && key <= '5') return Number(key);
  return null;
}

/**
 * Clickable stars in half steps (0.5–5), a slider for the keyboard: the arrows move half a star
 * (left adds in RTL), Home / End go to 0.5 / 5 and the digits 1–5 pick whole stars. Each star has
 * two halves: the start one gives the half star. Hovering previews the value. Works with
 * useController (`value`, `onChange`, `onBlur`, and `ref` as `inputRef` so a form error focuses it).
 *
 * @param {{
 *   value: number | null,
 *   onChange: (value: number) => void,
 *   onBlur?: () => void,
 *   labelId: string,
 *   invalid?: boolean,
 *   describedBy?: string,
 *   inputRef?: import('react').Ref<HTMLDivElement>,
 * }} props
 */
export function StarRatingInput({
  value,
  onChange,
  onBlur,
  labelId,
  invalid,
  describedBy,
  inputRef,
}) {
  const [hovered, setHovered] = useState(null);
  const shown = hovered ?? value ?? 0;

  function handleKeyDown(event) {
    const isRtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const next = ratingForKey(event.key, value ?? 0, isRtl);
    if (next === null) return;
    event.preventDefault();
    onChange(Math.max(MIN, next));
  }

  let valueText = text.pickRating;
  if (value) valueText = text.ratingValue(formatRating(value));

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <div
        ref={inputRef}
        role="slider"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={MAX}
        aria-valuenow={value ?? 0}
        aria-valuetext={valueText}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        onPointerLeave={() => setHovered(null)}
        className="flex items-center gap-1 rounded-md p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {STAR_POSITIONS.map((position) => (
          <span key={position} className="relative flex cursor-pointer">
            <RatingStar fill={starFill(shown, position)} size={STAR_SIZE} />
            <span
              aria-hidden="true"
              className="absolute inset-y-0 start-0 w-1/2"
              onPointerEnter={() => setHovered(position - STEP)}
              onClick={() => onChange(position - STEP)}
            />
            <span
              aria-hidden="true"
              className="absolute inset-y-0 end-0 w-1/2"
              onPointerEnter={() => setHovered(position)}
              onClick={() => onChange(position)}
            />
          </span>
        ))}
      </div>
      <span
        aria-hidden="true"
        className={clsx(
          'text-[13px] leading-[1.72]',
          value ? 'font-semibold text-text' : 'text-muted',
        )}
      >
        {valueText}
      </span>
    </div>
  );
}
