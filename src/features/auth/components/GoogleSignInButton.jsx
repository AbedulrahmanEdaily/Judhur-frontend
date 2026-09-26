import { IconGooglePlaceholder } from '../../../components/icons/index.js';
import { useToast } from '../../../components/ui/useToast.js';
import { ar } from '../../../locales/ar.js';

/**
 * Figma "دخول Google" (70:1856): the Google button + the "أو بالبريد الإلكتروني" divider.
 * Button: bg/canvas, border/strong, radius md, 13px vertical padding, 10 gap, text 14.5/1.72
 * (14 on mobile) and a 20px bg/inset box holding the icon placeholder the design ships with.
 * The backend has no Google sign-in yet, so a click only says it is coming soon.
 */
export function GoogleSignInButton() {
  const toast = useToast();

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => toast.show({ tone: 'warning', message: ar.auth.googleSoon })}
        className="flex w-full items-center justify-center gap-2.5 rounded-md border border-border-strong bg-bg py-3 text-[14px] leading-[1.72] font-semibold text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand xl:text-[14.5px]"
      >
        <span className="flex size-5 items-center justify-center rounded-[4px] border border-border bg-inset text-muted">
          <IconGooglePlaceholder />
        </span>
        {ar.auth.google}
      </button>

      <div className="flex items-center gap-3 xl:gap-3.5">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[12px] leading-[1.72] text-muted xl:hidden">
          {ar.auth.orEmailShort}
        </span>
        <span className="hidden text-[12.5px] leading-[1.72] text-muted xl:inline">
          {ar.auth.orEmail}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
