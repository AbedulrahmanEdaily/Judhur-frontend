import { IconShare } from '../../../components/icons/index.js';
import { useToast } from '../../../components/ui/useToast.js';
import { ar } from '../../../locales/ar.js';

/**
 * Figma «مشاركة» (65:1173): bg/surface, border/subtle, radius md, 14×9, 16px icon.
 * Uses the phone's share sheet when there is one, otherwise copies the link.
 *
 * @param {{ title: string }} props
 */
export function ShareButton({ title }) {
  const toast = useToast();

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.show({ tone: 'success', message: ar.property.linkCopied });
    } catch {
      // The user closed the share sheet, or the clipboard is blocked: nothing to report.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-[7px] rounded-md border border-border bg-surface px-[13px] py-2 text-[13px] leading-[1.72] font-semibold text-text-secondary transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <IconShare className="text-muted" />
      {ar.property.share}
    </button>
  );
}
