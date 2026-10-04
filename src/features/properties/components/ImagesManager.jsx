import { useId, useState } from 'react';
import clsx from 'clsx';
import {
  IconCountCheck,
  IconPhotoRemove,
  IconUploadImage,
  IconWarning20,
} from '../../../components/icons/index.js';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.jsx';
import { Spinner } from '../../../components/ui/Spinner.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { actionErrorMessage } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { IMAGE_FILE_TYPES, MAX_IMAGE_SIZE, MAX_IMAGES, MIN_IMAGES } from '../constants.js';
import {
  useDeletePropertyImageMutation,
  useSetMainPropertyImageMutation,
  useUploadPropertyImageMutation,
} from '../propertiesApi.js';

const text = ar.listing;

/**
 * Figma "صور العقار" (92:2274): the dashed brand drop zone, a three-column grid of 170px
 * photos with the white remove circle and the «صورة الغلاف» pill, and the counter with the
 * success chip. Used by the create wizard and the owner page.
 * Files are checked here (type, 5 MB, 10 images) and uploaded one at a time — parallel uploads
 * can collide on the image order. The cover can't be removed (the API refuses); «اجعلها الغلاف»
 * is not in Figma (the API has no reordering, so the cover is picked, not dragged).
 * On a published (approved) listing, adding an image or changing the cover sends it back to
 * review, so both ask first; it must also keep 3 images, so delete stops at 3. A rejected
 * listing gets a note that these changes send it back to review.
 *
 * @param {{
 *   propertyId: string,
 *   images: import('../../../api/types.js').PropertyImage[],
 *   message?: string | null,
 *   moderationStatus?: import('../../../api/types.js').ModerationStatus,
 * }} props
 */
export function ImagesManager({ propertyId, images, message, moderationStatus }) {
  const toast = useToast();
  const inputId = useId();
  const [uploadImage] = useUploadPropertyImageMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeletePropertyImageMutation();
  const [setMainImage] = useSetMainPropertyImageMutation();
  const [progress, setProgress] = useState(null);
  const [problems, setProblems] = useState([]);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  // On an approved listing: { type: 'upload', files, problems } or { type: 'cover', image }.
  const [reviewChange, setReviewChange] = useState(null);

  const isUploading = progress !== null;
  const isFull = images.length >= MAX_IMAGES;
  const isApproved = moderationStatus === 'Approved';
  const isRejected = moderationStatus === 'Rejected';
  const keepsMinimum = isApproved && images.length <= MIN_IMAGES;

  /** Checks type, size and room; returns the accepted files and the messages for the others. */
  function checkFiles(fileList) {
    const found = [];
    const accepted = [];
    let room = MAX_IMAGES - images.length;
    for (const file of Array.from(fileList)) {
      if (!IMAGE_FILE_TYPES.includes(file.type)) {
        found.push(text.imageBadType(file.name));
      } else if (file.size > MAX_IMAGE_SIZE) {
        found.push(text.imageTooBig(file.name));
      } else if (room <= 0) {
        if (!found.includes(text.imagesLimit(MAX_IMAGES))) found.push(text.imagesLimit(MAX_IMAGES));
      } else {
        accepted.push(file);
        room -= 1;
      }
    }
    return { accepted, found };
  }

  function chooseFiles(fileList) {
    const { accepted, found } = checkFiles(fileList);
    if (isApproved && accepted.length > 0) {
      setProblems(found);
      setReviewChange({ type: 'upload', files: accepted, problems: found });
      return;
    }
    uploadFiles(accepted, found);
  }

  async function uploadFiles(accepted, found) {
    const messages = [...found];
    // One request at a time, each awaited before the next.
    for (let index = 0; index < accepted.length; index += 1) {
      setProgress({ current: index + 1, total: accepted.length });
      try {
        await uploadImage({ propertyId, file: accepted[index] }).unwrap();
      } catch (error) {
        messages.push(text.imageFailed(accepted[index].name, actionErrorMessage(error)));
      }
    }
    setProgress(null);
    setProblems(messages);
  }

  function handleInputChange(event) {
    chooseFiles(event.target.files);
    // Let the same file be picked again after a failure.
    event.target.value = '';
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    if (isUploading || isFull) return;
    chooseFiles(event.dataTransfer.files);
  }

  function handleMakeCover(image) {
    if (isApproved) {
      setReviewChange({ type: 'cover', image });
      return;
    }
    makeCover(image);
  }

  async function makeCover(image) {
    try {
      await setMainImage({ propertyId, imageId: image.id }).unwrap();
    } catch (error) {
      toast.show({ tone: 'error', message: actionErrorMessage(error) });
    }
  }

  function handleConfirmReviewChange() {
    const change = reviewChange;
    setReviewChange(null);
    if (change.type === 'upload') uploadFiles(change.files, change.problems);
    else makeCover(change.image);
  }

  async function handleConfirmDelete() {
    try {
      await deleteImage({ propertyId, imageId: imageToDelete.id }).unwrap();
      setImageToDelete(null);
    } catch (error) {
      setImageToDelete(null);
      toast.show({ tone: 'error', message: actionErrorMessage(error) });
    }
  }

  const missing = MIN_IMAGES - images.length;

  /** Why a remove button is off (the cover, or a published listing at 3 images). */
  function removeTitle(image) {
    if (image.isMainImage) return text.coverCannotBeRemoved;
    if (keepsMinimum) return text.minImagesKeep(MIN_IMAGES);
    return text.removeImage;
  }

  let reviewConfirmLabel = text.confirmImagesApproved.confirmUpload;
  if (reviewChange?.type === 'cover') reviewConfirmLabel = text.confirmImagesApproved.confirmCover;

  return (
    <section className="flex flex-col gap-[18px] xl:rounded-lg xl:border xl:border-border xl:bg-raised xl:px-[25px] xl:py-[23px]">
      <div className="flex flex-col gap-[3px]">
        <h2 className="text-[18px] leading-[1.55] font-semibold text-text xl:text-[20px]">
          {text.imagesTitle}
        </h2>
        <p className="text-[13px] leading-[1.75] text-text-secondary">
          {text.imagesSubtitle(MIN_IMAGES)}
        </p>
      </div>

      {isRejected && (
        <p className="rounded-md bg-info-soft px-3.5 py-2.5 text-[13px] leading-[1.72] text-info">
          {text.imagesRejectedNote}
        </p>
      )}

      <label
        htmlFor={inputId}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          'flex cursor-pointer flex-col items-center gap-2.5 rounded-md border border-dashed border-brand bg-brand-subtle px-4 py-[21px] text-center transition-colors',
          'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand',
          isDragging && 'bg-brand/15',
          (isUploading || isFull) && 'cursor-not-allowed opacity-60',
        )}
      >
        <span className="rounded-full bg-raised p-[13px] text-brand">
          <IconUploadImage />
        </span>
        <span className="text-[15px] leading-[1.75] font-semibold text-text xl:text-[16px]">
          {text.imagesDrop}
        </span>
        <span className="text-[13px] leading-[1.75] text-text-secondary">
          {text.imagesRules(MAX_IMAGES)}
        </span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={IMAGE_FILE_TYPES.join(',')}
          disabled={isUploading || isFull}
          onChange={handleInputChange}
          className="sr-only"
        />
      </label>

      {isUploading && (
        <p
          role="status"
          className="flex items-center gap-2 text-[13px] leading-[1.75] text-text-secondary"
        >
          <Spinner size={16} />
          {text.uploadingImages(progress.current, progress.total)}
        </p>
      )}
      {problems.length > 0 && (
        <FormAlert>
          {problems.map((problem) => (
            <p key={problem}>{problem}</p>
          ))}
        </FormAlert>
      )}

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3 xl:gap-4">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="relative h-[120px] overflow-hidden rounded-md bg-inset xl:h-[170px]"
            >
              <img
                src={image.url}
                alt={ar.property.showImage(index + 1)}
                loading="lazy"
                className="size-full object-cover"
              />
              {image.isMainImage && (
                <span className="absolute start-2.5 top-2.5 rounded-full bg-brand px-3 py-[5px] text-[12px] leading-[1.75] font-semibold text-inverse">
                  {text.cover}
                </span>
              )}
              {!image.isMainImage && (
                <button
                  type="button"
                  onClick={() => handleMakeCover(image)}
                  className="absolute start-2.5 bottom-2.5 rounded-full bg-black/55 px-3 py-1 text-[12px] leading-[1.75] font-semibold text-white transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {text.makeCover}
                </button>
              )}
              <button
                type="button"
                onClick={() => setImageToDelete(image)}
                disabled={image.isMainImage || keepsMinimum}
                aria-label={text.removeImage}
                title={removeTitle(image)}
                className="absolute end-2.5 top-2.5 flex size-[30px] items-center justify-center rounded-full bg-raised text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:text-muted disabled:opacity-70"
              >
                <IconPhotoRemove />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <p className="text-[13px] leading-[1.75] text-text-secondary">
          {text.imagesCount(images.length, MAX_IMAGES)}
        </p>
        {missing <= 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1.5 text-[13px] leading-[1.75] font-semibold text-success">
            <IconCountCheck />
            {text.imagesEnough(MIN_IMAGES)}
          </span>
        )}
        {missing > 0 && (
          <span className="rounded-full bg-warning-soft px-3 py-1.5 text-[13px] leading-[1.75] font-semibold text-warning">
            {text.imagesMissing(missing)}
          </span>
        )}
      </div>
      {message && missing > 0 && <p className="text-caption text-danger">{message}</p>}

      <ConfirmDialog
        open={imageToDelete !== null}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={text.confirmRemoveImage.title}
        description={text.confirmRemoveImage.description}
        confirmLabel={text.confirmRemoveImage.confirm}
        loading={isDeleting}
      />
      <ConfirmDialog
        open={reviewChange !== null}
        onClose={() => setReviewChange(null)}
        onConfirm={handleConfirmReviewChange}
        title={text.confirmImagesApproved.title}
        description={text.confirmImagesApproved.description}
        confirmLabel={reviewConfirmLabel}
        tone="warning"
        icon={IconWarning20}
      />
    </section>
  );
}
