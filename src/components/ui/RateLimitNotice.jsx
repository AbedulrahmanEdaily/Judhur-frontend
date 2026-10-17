import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { rateLimitEnded, selectRateLimitedUntil } from '../../features/ui/uiSlice.js';
import { formatNumber } from '../../lib/format.js';
import { ar } from '../../locales/ar.js';

function secondsUntil(until) {
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

/** @param {{ until: number }} props */
function Countdown({ until }) {
  const dispatch = useDispatch();
  const [seconds, setSeconds] = useState(() => secondsUntil(until));

  useEffect(() => {
    const timer = window.setInterval(() => {
      const left = secondsUntil(until);
      setSeconds(left);
      if (left === 0) dispatch(rateLimitEnded());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [until, dispatch]);

  return (
    <div
      role="status"
      className="fixed inset-x-4 top-4 z-[60] mx-auto w-fit max-w-[calc(100%-2rem)] rounded-md border border-warning/30 bg-warning-soft px-4 py-2.5 text-center text-[13.5px] leading-[1.72] font-semibold text-text shadow-menu"
    >
      {ar.errors.rateLimitedFor(formatNumber(seconds))}
    </div>
  );
}

export function RateLimitNotice() {
  const until = useSelector(selectRateLimitedUntil);
  if (until === null) return null;
  return <Countdown key={until} until={until} />;
}
