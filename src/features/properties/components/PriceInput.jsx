import { useId } from 'react';
import { CURRENCY_SYMBOL } from '../../../lib/format.js';

/**
 * A price field of the filters panel (Figma 52:919): label 11.5 muted over a 10-radius box
 * (bg/canvas, border/strong, 12×9) with the value 13.5 and the currency symbol 12 muted.
 *
 * @param {{ label: string, value: string, onChange: (value: string) => void }} props
 */
export function PriceInput({ label, value, onChange }) {
  const inputId = useId();

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <label htmlFor={inputId} className="text-[11.5px] leading-[1.7] text-muted">
        {label}
      </label>
      <div className="flex items-center gap-1 rounded-[10px] border border-border-strong bg-bg px-[11px] py-2 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand focus-within:ring-inset">
        <input
          id={inputId}
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full min-w-0 bg-transparent text-[13.5px] leading-[1.7] text-text outline-none"
        />
        <span className="shrink-0 text-[12px] leading-[1.7] text-muted">{CURRENCY_SYMBOL}</span>
      </div>
    </div>
  );
}
