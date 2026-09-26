import { useCallback, useEffect, useState } from 'react';

/**
 * Seconds left until `targetMs` (a timestamp), ticking every second. 0 once it has passed.
 * `now` only ticks while a countdown runs, so it can be up to a second stale right after the
 * target changes; `maxSeconds` (the countdown's length) caps that first value.
 *
 * @param {number | null} targetMs
 * @param {number} [maxSeconds]
 */
export function useCountdown(targetMs, maxSeconds = Infinity) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (targetMs == null) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (targetMs == null) return 0;
  return Math.min(maxSeconds, Math.max(0, Math.ceil((targetMs - now) / 1000)));
}

/**
 * A restartable cooldown: `[secondsLeft, start(durationMs)]`.
 * @returns {[number, (durationMs: number) => void]}
 */
export function useCooldown() {
  const [cooldown, setCooldown] = useState(
    /** @type {{ until: number, seconds: number } | null} */ (null),
  );
  const secondsLeft = useCountdown(cooldown?.until ?? null, cooldown?.seconds);
  const start = useCallback(
    (durationMs) => setCooldown({ until: Date.now() + durationMs, seconds: durationMs / 1000 }),
    [],
  );
  return [secondsLeft, start];
}

/** 272 → "4:32" */
export function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}
