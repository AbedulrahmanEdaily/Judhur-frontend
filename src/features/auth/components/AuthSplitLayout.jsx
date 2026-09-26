import { Logo } from '../../../components/layout/Logo.jsx';
import { IconCheckSmall13 } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';

/**
 * Login / register layout.
 * Desktop (Figma 69:1159, 69:1262): the form panel (880, 110×60 padding) next to the 560px
 * identity panel — a Property Photo under the "طبقة تعتيم" gradient, pinned to Dark mode.
 * Mobile (Figma 84:716): the gradient "الهوية" header, then the form from the top (24×28 padding).
 *
 * @param {{
 *   photo: string,
 *   mobileTitle: string,
 *   mobileSubtitle: string,
 *   children: import('react').ReactNode,
 * }} props
 */
export function AuthSplitLayout({ photo, mobileTitle, mobileSubtitle, children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg xl:flex-row">
      <div className="flex flex-col items-center gap-3 bg-auth-hero px-6 pt-10 pb-[34px] text-center xl:hidden">
        <Logo size={72} decorative />
        <h1 className="text-[22px] leading-[1.68] font-bold text-white">{mobileTitle}</h1>
        <p className="text-[13px] leading-[1.68] text-white/75">{mobileSubtitle}</p>
      </div>

      <main className="flex flex-1 flex-col bg-bg px-6 py-7 xl:justify-center xl:px-[110px] xl:py-[60px]">
        <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4 xl:max-w-none xl:gap-[18px]">
          {children}
        </div>
      </main>

      <aside className="dark relative hidden w-[560px] shrink-0 flex-col justify-center gap-[22px] overflow-hidden px-16 py-[70px] xl:flex">
        <img src={photo} alt="" className="absolute inset-0 size-full" />
        <div className="absolute inset-0 bg-auth-overlay" />

        <div className="relative flex items-center gap-3.5">
          <Logo size={56} decorative />
          <span className="text-[32px] leading-[1.75] font-bold text-white">{ar.app.name}</span>
        </div>
        <p className="relative text-[30px] leading-[1.75] font-bold text-white">
          {ar.auth.panel.headline}
        </p>
        {ar.auth.panel.points.map((point) => (
          <div key={point} className="relative flex items-center gap-2.5">
            <span className="rounded-full bg-white/16 p-[5px] text-white">
              <IconCheckSmall13 />
            </span>
            <span className="text-[14.5px] leading-[1.75] text-white/80">{point}</span>
          </div>
        ))}
      </aside>
    </div>
  );
}
