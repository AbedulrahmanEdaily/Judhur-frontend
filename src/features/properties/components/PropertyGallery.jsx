import { useState } from 'react';
import clsx from 'clsx';
import { IconBackButton } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import { PropertyPhoto } from './PropertyPhoto.jsx';

/** The main image first, then the rest in their display order (the API sorts by it). */
function orderImages(images) {
  const main = images.filter((image) => image.isMainImage);
  const rest = images.filter((image) => !image.isMainImage);
  return [...main, ...rest];
}

/**
 * Desktop: Figma "المعرض" (65:1203) — the selected photo (radius 18, 522 high) and a 230px
 * column of up to three thumbnails (132 high, radius 14) plus the «+N صور أخرى» tile.
 * Mobile: the 250px photo strip of 83:676 (swipe between photos) with the back button and, at
 * the end, `favoriteButton` (the heart 83:677, passed in by the page).
 * A listing without photos shows the Figma Property Photo.
 *
 * @param {{
 *   images: import('../../../api/types.js').PropertyImage[],
 *   title: string,
 *   onBack: () => void,
 *   favoriteButton?: import('react').ReactNode,
 * }} props
 */
export function PropertyGallery({ images, title, onBack, favoriteButton }) {
  const photos = orderImages(images);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const others = photos
    .map((photo, index) => ({ photo, index }))
    .filter((item) => item.index !== selectedIndex);
  const thumbnails = others.slice(0, 3);
  const nextHidden = others[3];

  return (
    <>
      <section className="hidden gap-3 bg-bg px-20 pb-7 xl:flex">
        <div className="h-[522px] min-w-0 flex-1 overflow-hidden rounded-[18px]">
          <PropertyPhoto src={photos[selectedIndex]?.url} alt={title} />
        </div>
        {others.length > 0 && (
          <div className="flex w-[230px] shrink-0 flex-col gap-3">
            {thumbnails.map(({ photo, index }) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={ar.property.showImage(index + 1)}
                className="h-[132px] overflow-hidden rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <PropertyPhoto src={photo.url} />
              </button>
            ))}
            {nextHidden && (
              <button
                type="button"
                onClick={() => setSelectedIndex(nextHidden.index)}
                className="flex h-[90px] items-center justify-center rounded-lg bg-inset text-[14px] leading-[1.72] font-semibold text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {ar.property.moreImages(others.length - 3)}
              </button>
            )}
          </div>
        )}
      </section>

      <section className="relative order-first h-[250px] xl:hidden">
        <div className="flex h-full snap-x snap-mandatory overflow-x-auto">
          {photos.length === 0 && <PropertyPhoto className="shrink-0" />}
          {photos.map((photo) => (
            <div key={photo.id} className="h-full w-full shrink-0 snap-center">
              <PropertyPhoto src={photo.url} alt={title} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onBack}
          aria-label={ar.property.back}
          className={clsx(
            'absolute start-4 top-3.5 rounded-full bg-white/92 p-2 text-text-secondary',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
          )}
        >
          <IconBackButton />
        </button>
        {favoriteButton}
      </section>
    </>
  );
}
