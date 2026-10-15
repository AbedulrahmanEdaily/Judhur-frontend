/**
 * How full the star at `position` (1–5) is for a rating, which is first rounded to half a star.
 *
 * @param {number} rating
 * @param {number} position
 * @returns {'full'|'half'|'empty'}
 */
export function starFill(rating, position) {
  const rounded = Math.round(rating * 2) / 2;
  if (rounded >= position) return 'full';
  if (rounded >= position - 0.5) return 'half';
  return 'empty';
}

export const STAR_POSITIONS = [1, 2, 3, 4, 5];
