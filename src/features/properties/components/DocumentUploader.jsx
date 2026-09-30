import { useId, useState } from 'react';
import clsx from 'clsx';
import {
  IconFile,
  IconFileDone,
  IconPrivacyInfo,
  IconUploadArrow,
} from '../../../components/icons/index.js';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.jsx';
import { Spinner } from '../../../components/ui/Spinner.jsx';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { formatNumber } from '../../../lib/format.js';
import { actionErrorMessage } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { DOCUMENT_FILE_TYPES, MAX_DOCUMENT_SIZE } from '../constants.js';
import { useUploadOwnershipDocumentMutation } from '../propertiesApi.js';

const text = ar.listing;

/** Bytes → "2.4" (megabytes, one decimal, at least 0.1). */
function megabytes(size) {
  const tenths = Math.max(1, Math.round((size / (1024 * 1024)) * 10));
  return formatNumber(tenths / 10);
}

/**
 * Figma "وثيقة الملكية" (94:2466) with "رفع وثيقة / Uploader" (46:810): the dashed bg/surface
 * box (1.5px border/strong, radius lg, 20 padding), the drop area, and the uploaded-file row;
 * then the info note on privacy. The document itself is never sent back to the owner, so after
 * a reload the row says it is uploaded without a file name.
 * `confirmReplace` asks first (an approved listing goes back to review when it changes).
 *
 * @param {{
 *   propertyId: string,
 *   hasDocument: boolean,
 *   confirmReplace?: boolean,
 *   message?: string | null,
 * }} props
 */
export function DocumentUploader({ propertyId, hasDocument, confirmReplace = false, message }) {
  const inputId = useId();
  const [uploadDocument, { isLoading }] = useUploadOwnershipDocumentMutation();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [problem, setProblem] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  async function upload(file) {
    setPendingFile(null);
    try {
      await uploadDocument({ propertyId, file }).unwrap();
      setUploadedFile({ name: file.name, size: file.size });
    } catch (error) {
      setProblem(actionErrorMessage(error));
    }
  }

  function chooseFile(file) {
    if (!file) return;
    setProblem(null);
    if (!DOCUMENT_FILE_TYPES.includes(file.type)) {
      setProblem(text.documentBadType);
      return;
    }
    if (file.size > MAX_DOCUMENT_SIZE) {
      setProblem(text.documentTooBig);
      return;
    }
    if (confirmReplace && hasDocument) {
      setPendingFile(file);
      return;
    }
    upload(file);
  }

  function handleInputChange(event) {
    chooseFile(event.target.files[0]);
    event.target.value = '';
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    if (isLoading) return;
    chooseFile(event.dataTransfer.files[0]);
  }

  let fileName = text.documentUploaded;
  let fileNote = text.documentReplaceHint;
  if (uploadedFile) {
    fileName = uploadedFile.name;
    fileNote = text.fileSize(megabytes(uploadedFile.size));
  }

  return (
    <section className="flex flex-col gap-[18px] xl:rounded-lg xl:border xl:border-border xl:bg-raised xl:px-[25px] xl:py-[23px]">
      <div className="flex flex-col gap-[3px]">
        <h2 className="text-[18px] leading-[1.55] font-semibold text-text xl:text-[20px]">
          {text.documentTitle}
        </h2>
        <p className="text-[13px] leading-[1.75] text-text-secondary">{text.documentSubtitle}</p>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          'flex flex-col gap-3.5 rounded-lg border-[1.5px] border-dashed border-border-strong bg-surface p-[18.5px] transition-colors',
          isDragging && 'border-brand bg-brand-subtle',
        )}
      >
        <label
          htmlFor={inputId}
          className={clsx(
            'flex cursor-pointer flex-col items-center gap-2.5 rounded-md py-4 text-center',
            'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand',
            isLoading && 'cursor-not-allowed opacity-60',
          )}
        >
          <span className="rounded-full bg-brand-subtle p-[13px] text-brand">
            <IconUploadArrow />
          </span>
          <span className="text-[14.5px] leading-[1.72] font-semibold text-text">
            {text.documentDrop}
          </span>
          <span className="text-[12px] leading-[1.72] text-muted">{text.documentRules}</span>
          <input
            id={inputId}
            type="file"
            accept={DOCUMENT_FILE_TYPES.join(',')}
            disabled={isLoading}
            onChange={handleInputChange}
            className="sr-only"
          />
        </label>

        {isLoading && (
          <p
            role="status"
            className="flex items-center justify-center gap-2 text-[13px] leading-[1.75] text-text-secondary"
          >
            <Spinner size={16} />
            {text.documentUploading}
          </p>
        )}

        {!isLoading && (hasDocument || uploadedFile) && (
          <div className="flex items-center gap-3 rounded-md border border-border bg-raised px-[13px] py-[11px]">
            <IconFile className="shrink-0 text-muted" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p
                dir="auto"
                className="truncate text-[13.5px] leading-[1.72] font-semibold text-text"
              >
                {fileName}
              </p>
              <p className="text-[11.5px] leading-[1.72] text-muted">{fileNote}</p>
            </div>
            <span className="flex-1" />
            <span className="rounded-full bg-success-soft p-[5px] text-success">
              <IconFileDone />
            </span>
          </div>
        )}
      </div>

      {problem && <FormAlert>{problem}</FormAlert>}
      {message && <p className="text-caption text-danger">{message}</p>}

      <p className="flex gap-2.5 rounded-md bg-info-soft px-4 py-3.5 text-[13px] leading-[1.75] text-text-secondary">
        <IconPrivacyInfo className="mt-1 shrink-0 text-info" />
        {text.documentPrivacy}
      </p>

      <ConfirmDialog
        open={pendingFile !== null}
        onClose={() => setPendingFile(null)}
        onConfirm={() => upload(pendingFile)}
        tone="warning"
        title={text.confirmReplaceDocument.title}
        description={text.confirmReplaceDocument.description}
        confirmLabel={text.confirmReplaceDocument.confirm}
      />
    </section>
  );
}
