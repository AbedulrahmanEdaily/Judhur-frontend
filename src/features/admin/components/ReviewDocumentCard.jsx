import { useState } from 'react';
import { IconDocumentOpen, IconFactDocument } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';

const text = ar.admin;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/** 'pdf', 'image' or 'unknown', from the file name in the signed link (the query is ignored). */
function documentKind(url) {
  let path;
  try {
    path = new URL(url, window.location.href).pathname.toLowerCase();
  } catch {
    return 'unknown';
  }
  if (path.endsWith('.pdf')) return 'pdf';
  for (const extension of IMAGE_EXTENSIONS) {
    if (path.endsWith(extension)) return 'image';
  }
  return 'unknown';
}

/**
 * Figma "بطاقة" of the review page (81:844): the accent/solid card with the document title,
 * «سرّية …», «افتح بحجم كامل» and the 330px preview area. The preview shows the signed document
 * itself (not in Figma): an image in an <img>, a PDF in an <object> when the browser has a PDF
 * viewer. Anything else (another file type, an image that fails to load, no PDF viewer) shows a
 * short note pointing to «افتح بحجم كامل». The link is valid for 10 minutes and the page fetches a new one when it runs out, so
 * the preview and the button wait while `isRefreshing`.
 *
 * @param {{
 *   legalStatus: string,
 *   documentUrl?: string,
 *   isRefreshing: boolean,
 * }} props
 */
export function ReviewDocumentCard({ legalStatus, documentUrl, isRefreshing }) {
  // The link whose image failed to load; a new link gets a new try.
  const [failedUrl, setFailedUrl] = useState(null);

  let kind = 'none';
  if (documentUrl) kind = documentKind(documentUrl);
  if (documentUrl && failedUrl === documentUrl) kind = 'failed';
  // Browsers without a PDF viewer (most phones) report it here; they get the note.
  if (kind === 'pdf' && navigator.pdfViewerEnabled === false) kind = 'failed';

  const noteClasses = 'px-6 text-center text-[14px] leading-[1.74] font-semibold text-white/60';
  let preview = <p className={noteClasses}>{text.noDocument}</p>;
  if (documentUrl && isRefreshing) {
    preview = <p className={noteClasses}>{text.documentRefreshing}</p>;
  } else if (kind === 'image') {
    preview = (
      <img
        src={documentUrl}
        alt={text.documentPreview(legalStatus)}
        referrerPolicy="no-referrer"
        onError={() => setFailedUrl(documentUrl)}
        className="size-full object-contain"
      />
    );
  } else if (kind === 'pdf') {
    preview = (
      <object
        data={documentUrl}
        type="application/pdf"
        aria-label={text.documentPreview(legalStatus)}
        className="size-full"
      >
        <p className={noteClasses}>{text.documentPreviewFailed}</p>
      </object>
    );
  } else if (kind === 'unknown' || kind === 'failed') {
    preview = <p className={noteClasses}>{text.documentPreviewFailed}</p>;
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg bg-accent px-5 py-5 text-white xl:px-6 xl:py-[22px]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-white/15 p-2">
          <IconFactDocument />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-[17px] leading-[1.74] font-bold">
            {text.documentTitle(legalStatus)}
          </h2>
          <p className="text-[12px] leading-[1.74] text-white/60">{text.documentPrivate}</p>
        </div>
        {documentUrl && !isRefreshing && (
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[7px] rounded-[10px] bg-white/14 px-3.5 py-2 text-[12.5px] leading-[1.74] font-semibold transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {text.openDocument}
            <IconDocumentOpen />
          </a>
        )}
      </div>
      <div className="flex h-[200px] items-center justify-center overflow-hidden rounded-[14px] border border-white/18 bg-white/8 xl:h-[330px]">
        {preview}
      </div>
    </section>
  );
}
