import { IconShield18 } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';

/** Figma "نصائح للتعامل الآمن" (67:1222): static tips on brand/subtle. */
export function SafetyTips() {
  return (
    <section className="flex flex-col gap-4 rounded-lg bg-brand-subtle p-5">
      <h2 className="flex items-center gap-2.5 text-[15px] leading-[1.78] font-bold text-brand-text">
        <IconShield18 />
        {ar.property.tipsTitle}
      </h2>
      <ul className="flex flex-col gap-4">
        {ar.property.tips.map((tip) => (
          <li
            key={tip}
            className="text-[12.5px] leading-[1.78] whitespace-pre-wrap text-text-secondary"
          >
            {`•  ${tip}`}
          </li>
        ))}
      </ul>
    </section>
  );
}
