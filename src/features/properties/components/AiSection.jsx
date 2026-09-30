import { IconAiChat, IconAiPrice } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';

const text = ar.home;

// Right to left as in Figma: the assistant card, then the price estimator.
const features = [
  { Icon: IconAiChat, title: text.aiChatTitle, body: text.aiChatText, tag: text.aiChatTag },
  { Icon: IconAiPrice, title: text.aiPriceTitle, body: text.aiPriceText, tag: text.aiPriceTag },
];

/**
 * Figma "الذكاء الاصطناعي" (51:735): static marketing copy on accent/solid. Desktop only —
 * the mobile home frame has no such section.
 */
export function AiSection() {
  return (
    <section className="hidden flex-col gap-[30px] bg-accent px-[120px] py-[68px] xl:flex">
      <div className="flex flex-col gap-2.5 leading-[1.75]">
        <h2 className="text-[28px] font-bold text-white">{text.aiTitle}</h2>
        <p className="text-[15px] text-white/72">{text.aiSubtitle}</p>
      </div>
      <ul className="flex gap-[22px]">
        {features.map(({ Icon, title, body, tag }) => (
          <li
            key={title}
            className="flex flex-1 flex-col items-start gap-3.5 rounded-lg border border-white/14 bg-white/7 px-[25px] pt-[27px] pb-[25px]"
          >
            <span className="rounded-full bg-white/14 p-[11px] text-white">
              <Icon />
            </span>
            <h3 className="text-[20px] leading-[1.75] font-bold text-white">{title}</h3>
            <p className="text-[14px] leading-[1.75] text-white/75">{body}</p>
            <span className="rounded-full bg-[rgb(33_191_133/0.2)] px-3.5 py-1.5 text-[12px] leading-[1.75] font-semibold text-white/95">
              {tag}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
