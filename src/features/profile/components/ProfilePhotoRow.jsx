import { useRef, useState } from 'react';
import clsx from 'clsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.jsx';
import { Spinner } from '../../../components/ui/Spinner.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { actionErrorMessage } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { IMAGE_FILE_TYPES, MAX_IMAGE_SIZE } from '../../properties/constants.js';
import { useDeleteMyPhotoMutation, useUploadMyPhotoMutation } from '../profileApi.js';

const text = ar.profile;

// Figma «غيّر» (79:1623): 18×10 (17×9 inside the 1px border), radius md, 13.5 semibold.
const buttonClasses =
  'flex items-center gap-2 rounded-md border px-[17px] py-[9px] text-[13.5px] leading-[1.72] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60';

/**
 * Figma «الصورة» row (79:1622): the 68px photo, «صورة الملف» with the allowed files, and
 * «غيّر الصورة» (bg/surface, border/strong, 18×10, 13.5 semibold) at the end. «احذف الصورة»
 * (with a confirm) is not in Figma. The file is checked here first (type and 5 MB), then sent.
 *
 * @param {{ profile: import('../../../api/types.js').MyProfile }} props
 */
export function ProfilePhotoRow({ profile }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [uploadPhoto, uploadState] = useUploadMyPhotoMutation();
  const [deletePhoto, deleteState] = useDeleteMyPhotoMutation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const isBusy = uploadState.isLoading || deleteState.isLoading;

  async function handleFileChange(event) {
    const file = event.target.files[0];
    // Let the same file be picked again after an error.
    event.target.value = '';
    if (!file) return;

    if (!IMAGE_FILE_TYPES.includes(file.type)) {
      toast.show({ tone: 'error', message: text.photoType });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.show({ tone: 'error', message: text.photoSize });
      return;
    }

    try {
      await uploadPhoto(file).unwrap();
      toast.show({ tone: 'success', message: text.photoSaved });
    } catch (error) {
      toast.show({ tone: 'error', message: actionErrorMessage(error) });
    }
  }

  async function handleDelete() {
    try {
      await deletePhoto().unwrap();
      setIsConfirmOpen(false);
      toast.show({ tone: 'success', message: text.photoDeleted });
    } catch (error) {
      setIsConfirmOpen(false);
      toast.show({ tone: 'error', message: actionErrorMessage(error) });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar
        name={profile.fullName}
        imageUrl={profile.profileImageUrl}
        sizeClassName="size-[68px] text-[26px]"
      />
      <div className="flex flex-col gap-px leading-[1.72]">
        <p className="text-[14px] font-semibold text-text">{text.photo}</p>
        <p className="text-[12px] text-muted">{text.photoHint}</p>
      </div>
      <span className="flex-1" />
      <div className="flex gap-2.5">
        {profile.profileImageUrl && (
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            disabled={isBusy}
            className={clsx(buttonClasses, 'border-transparent text-danger hover:bg-danger-soft')}
          >
            {text.deletePhoto}
          </button>
        )}
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          disabled={isBusy}
          aria-busy={uploadState.isLoading || undefined}
          className={clsx(
            buttonClasses,
            'border-border-strong bg-surface text-text hover:bg-inset',
          )}
        >
          {uploadState.isLoading && <Spinner size={14} />}
          {text.changePhoto}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_FILE_TYPES.join(',')}
        onChange={handleFileChange}
        aria-label={text.changePhoto}
        className="hidden"
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title={text.confirmDeletePhoto.title}
        description={text.confirmDeletePhoto.description}
        confirmLabel={text.confirmDeletePhoto.confirm}
        loading={deleteState.isLoading}
      />
    </div>
  );
}
