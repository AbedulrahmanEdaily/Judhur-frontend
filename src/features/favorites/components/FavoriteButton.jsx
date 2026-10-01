import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import clsx from 'clsx';
import { IconFavoriteHeart } from '../../../components/icons/index.js';
import { useToast } from '../../../components/ui/useToast.js';
import { actionErrorMessage } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { loginPathFor } from '../../../routes/redirect.js';
import { selectIsAuthenticated } from '../../auth/authSlice.js';
import { useAddFavoriteMutation, useRemoveFavoriteMutation } from '../favoritesApi.js';
import { useFavoriteIds } from '../useFavoriteIds.js';

const text = ar.favorites;

// card: Figma «مفضلة» on the card photo (33:4) — white/92 circle, 8px padding, 18px heart.
// gallery: the same on the mobile details photo (83:677), 17px heart.
// details: «حفظ» next to «مشاركة» (65:1177) — the share button's look, 16px heart.
const variants = {
  card: {
    classes: 'rounded-full bg-white/92 p-2',
    iconSize: 18,
    iconColor: 'text-text-secondary',
  },
  gallery: {
    classes: 'rounded-full bg-white/92 p-2',
    iconSize: 17,
    iconColor: 'text-text-secondary',
  },
  details: {
    classes:
      'flex items-center gap-[7px] rounded-md border border-border bg-surface px-[13px] py-2 text-[13px] leading-[1.72] font-semibold text-text-secondary transition-colors hover:bg-inset',
    iconSize: 16,
    iconColor: 'text-muted',
  },
};

const focusClasses =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/**
 * The heart. A signed-in user toggles the favorite (optimistic, the project guide 6.9); a guest
 * goes to login and comes back to this page; an admin gets nothing (admins never favorite).
 * Saved: a filled brand heart (and «محفوظ» on details); not saved: the outline.
 *
 * @param {{
 *   propertyId: string,
 *   title: string,
 *   variant?: 'card' | 'gallery' | 'details',
 *   className?: string,
 * }} props
 */
export function FavoriteButton({ propertyId, title, variant = 'card', className }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { canFavorite, favoriteIds } = useFavoriteIds();
  const location = useLocation();
  const toast = useToast();
  const [addFavorite, addState] = useAddFavoriteMutation();
  const [removeFavorite, removeState] = useRemoveFavoriteMutation();

  const { classes, iconSize, iconColor } = variants[variant];
  const showLabel = variant === 'details';

  // Signed in without the User role: an admin.
  if (isAuthenticated && !canFavorite) return null;

  if (!isAuthenticated) {
    return (
      <Link
        to={loginPathFor(location)}
        aria-label={text.loginToSave}
        title={text.loginToSave}
        onClick={(event) => event.stopPropagation()}
        className={clsx(classes, focusClasses, className)}
      >
        <IconFavoriteHeart width={iconSize} height={iconSize} className={iconColor} />
        {showLabel && text.save}
      </Link>
    );
  }

  const isFavorite = favoriteIds.has(propertyId);
  const isBusy = addState.isLoading || removeState.isLoading;

  async function handleClick(event) {
    // The card is a link: the heart must not open the listing.
    event.preventDefault();
    event.stopPropagation();
    try {
      if (isFavorite) {
        await removeFavorite(propertyId).unwrap();
      } else {
        await addFavorite(propertyId).unwrap();
      }
    } catch (error) {
      toast.show({ tone: 'error', message: actionErrorMessage(error) });
    }
  }

  let label = text.add(title);
  if (isFavorite) label = text.remove(title);
  let visibleText = text.save;
  if (isFavorite) visibleText = text.saved;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
      className={clsx(classes, focusClasses, className)}
    >
      <IconFavoriteHeart
        filled={isFavorite}
        width={iconSize}
        height={iconSize}
        className={isFavorite ? 'text-brand' : iconColor}
      />
      {showLabel && visibleText}
    </button>
  );
}
