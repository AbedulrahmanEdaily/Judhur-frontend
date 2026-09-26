import { useEffect, useState } from 'react';

/**
 * Used by the check-email and reset-password pages.
 * Returns the whole seconds left until `targetTime` (a timestamp in ms), or 0 once it passed.
 * @param {number} targetTime
 */
export function useCountdown(targetTime) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const secondsLeft = Math.ceil((targetTime - now) / 1000);
  if (secondsLeft < 0) return 0;
  return secondsLeft;
}
