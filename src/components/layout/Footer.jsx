import { Logo } from './Logo.jsx';
import { ar } from '../../locales/ar.js';

const headingClasses = 'text-[15px] leading-[1.75] font-bold text-white';
const itemClasses = 'text-[13.5px] leading-[1.75] text-white/70';

/**
 * Figma "التذييل" (51:801). The frame is pinned to the Dark mode, so the `dark` class keeps it
 * dark in both themes. 120 side padding, 56 top / 34 bottom, 30 gap; columns 60 apart, their
 * text lined up on the left edge as in the frame (counter-axis MIN).
 * Links to pages that are not built yet are plain text for now. Desktop only — the mobile
 * frames have no footer.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dark hidden bg-bg xl:block">
      <div className="flex flex-col gap-[30px] px-[120px] pt-14 pb-[34px]">
        <div className="flex items-start gap-[60px]">
          <div className="flex w-[320px] shrink-0 flex-col gap-3">
            <div className="flex items-center gap-3">
              <Logo size={48} decorative />
              <span className="text-[26px] font-bold text-white">{ar.app.name}</span>
            </div>
            <p className={itemClasses}>{ar.footer.about}</p>
          </div>

          <div className="flex-1" />

          <div className="flex flex-col items-end gap-2.5 whitespace-nowrap">
            <p className={headingClasses}>{ar.footer.linksTitle}</p>
            <span className={itemClasses}>{ar.nav.properties}</span>
            <span className={itemClasses}>{ar.nav.map}</span>
            <span className={itemClasses}>{ar.nav.addProperty}</span>
          </div>

          <div className="flex flex-col items-end gap-2.5 whitespace-nowrap">
            <p className={headingClasses}>{ar.footer.platformTitle}</p>
            <span className={itemClasses}>{ar.nav.about}</span>
            <span className={itemClasses}>{ar.footer.howItWorks}</span>
            <span className={itemClasses}>{ar.footer.faq}</span>
          </div>

          <div className="flex flex-col items-end gap-2.5 whitespace-nowrap">
            <p className={headingClasses}>{ar.footer.contactTitle}</p>
            <a href={`mailto:${ar.footer.email}`} className={itemClasses}>
              {ar.footer.email}
            </a>
            <span className={itemClasses}>{ar.footer.location}</span>
          </div>
        </div>

        <div className="h-px bg-white/14" />

        <p className="text-[12.5px] leading-[1.75] text-white/55">{ar.footer.rights(year)}</p>
      </div>
    </footer>
  );
}
