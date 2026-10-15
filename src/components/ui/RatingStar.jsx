import clsx from 'clsx';
import { IconStar } from '../icons/index.js';

/**
 * One star of a rating: the empty star (border/strong) with the filled one (state/warning) on
 * top, cut to its start half for a half star — `start-0` puts that half on the right in RTL.
 *
 * @param {{ fill: 'full'|'half'|'empty', size?: number }} props
 */
export function RatingStar({ fill, size = 13 }) {
  return (
    <span className="relative flex shrink-0">
      <IconStar width={size} height={size} className="text-border-strong" />
      {fill !== 'empty' && (
        <span
          className={clsx(
            'absolute inset-y-0 start-0 flex overflow-hidden text-warning',
            fill === 'half' && 'w-1/2',
          )}
        >
          <IconStar width={size} height={size} className="shrink-0" />
        </span>
      )}
    </span>
  );
}
