import clsx from 'clsx';
import { Check, X } from 'lucide-react';
import { PASSWORD_RULES } from '../schemas.js';
import { ar } from '../../../locales/ar.js';

/** Live list of the four password rules; icon + text so color isn't the only signal. */
export function PasswordChecklist({ value = '' }) {
  const labels = ar.auth.passwordRules;

  return (
    <div className="rounded-md bg-surface px-4 py-3">
      <p className="mb-1.5 text-caption text-text-secondary">{labels.title}</p>
      <ul className="grid gap-1 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(value);
          const Icon = met ? Check : X;
          return (
            <li
              key={rule.key}
              className={clsx(
                'flex items-center gap-1.5 text-caption',
                met ? 'text-success' : 'text-muted',
              )}
            >
              <Icon size={14} aria-hidden="true" className="shrink-0" />
              <span>{labels[rule.key]}</span>
              <span className="sr-only">({met ? labels.met : labels.unmet})</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
