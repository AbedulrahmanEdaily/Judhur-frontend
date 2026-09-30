import { IconDocumentOpen, IconFactDocument } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';

const text = ar.admin;

/**
 * Figma "بطاقة" of the review page (81:844): the accent/solid card with the document title,
 * «سرّية …», «افتح بحجم كامل» and the 330px preview area. The signed link is opened in a new tab
 * (it can be a PDF or an image); it is valid for 10 minutes and the page fetches a new one when
 * it runs out, so the button waits while `isRefreshing`.
 *
 * @param {{
 *   legalStatus: string,
 *   documentUrl?: string,
 *   isRefreshing: boolean,
 * }} props
 */
export function ReviewDocumentCard({ legalStatus, documentUrl, isRefreshing }) {
  let preview = text.noDocument;
  if (documentUrl) preview = text.documentHint;
  if (documentUrl && isRefreshing) preview = text.documentRefreshing;

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
      <div className="flex h-[200px] items-center justify-center rounded-[14px] border border-white/18 bg-white/8 px-6 text-center text-[14px] leading-[1.74] font-semibold text-white/60 xl:h-[330px]">
        {preview}
      </div>
    </section>
  );
}
