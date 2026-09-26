import clsx from 'clsx';
import { PASSWORD_RULES } from '../schemas.js';
import { ar } from '../../../locales/ar.js';

/**
 * The live password rule chips of Figma "إنشاء حساب" (69:1362): 10 gap, chips 9×4 padding,
 * pill, 11.5/1.75 semibold; met = state/success on success-soft, not met = text/muted on bg/inset.
 */
export function PasswordRules({ password = '' }) {
  return (
    <ul className="flex flex-wrap gap-2.5">
      {PASSWORD_RULES.map((rule) => {
        const isMet = rule.test(password);
        return (
          <li
            key={rule.key}
            className={clsx(
              'rounded-full px-[9px] py-1 text-[11.5px] leading-[1.75] font-semibold',
              isMet ? 'bg-success-soft text-success' : 'bg-inset text-muted',
            )}
          >
            {ar.auth.passwordRules[rule.key]}
          </li>
        );
      })}
    </ul>
  );
}
