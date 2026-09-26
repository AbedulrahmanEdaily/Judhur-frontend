import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/Input.jsx';
import { ar } from '../../locales/ar.js';

/**
 * `<Input type="password">` with a show/hide toggle. Takes the same props as `<Input>`.
 * @param {import('react').ComponentProps<typeof Input>} props
 */
export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  const label = visible ? ar.auth.hidePassword : ar.auth.showPassword;

  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      dir="ltr"
      autoCapitalize="none"
      spellCheck={false}
      suffix={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={label}
          aria-pressed={visible}
          title={label}
          className="-me-1 flex rounded-sm p-1 text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-brand"
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      }
    />
  );
}
