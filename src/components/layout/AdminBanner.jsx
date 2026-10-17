import { IconAdminShield14 } from '../icons/index.js';
import { ar } from '../../locales/ar.js';

/**
 * Figma "شريط الإدارة" (80:754): a 36px accent/solid strip above the navbar with the shield and
 * a 12.5 semibold line in white at 90%, shown while an admin is signed in.
 */
export function AdminBanner() {
  return (
    // A named region, so the strip is inside a landmark like the rest of the page.
    <section
      aria-label={ar.admin.bannerLabel}
      className="flex items-center gap-2 bg-accent px-4 py-[7px] text-[12.5px] leading-[1.72] font-semibold text-white/90 xl:px-[70px]"
    >
      <IconAdminShield14 className="shrink-0" />
      {ar.admin.banner}
    </section>
  );
}
