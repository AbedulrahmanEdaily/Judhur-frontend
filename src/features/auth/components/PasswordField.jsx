import { useState } from 'react';
import { IconEye } from '../../../components/icons/index.js';
import { AuthInput } from './AuthInput.jsx';
import { ar } from '../../../locales/ar.js';

/**
 * AuthInput for passwords with the Figma eye icon (69:1247, 17px, text/muted) at the end.
 * Figma has no "hide" icon, so the same eye is used and the state is announced via aria-pressed.
 * @param {import('react').ComponentProps<typeof AuthInput>} props
 */
export function PasswordField(props) {
  const [isVisible, setIsVisible] = useState(false);

  let buttonLabel = ar.auth.showPassword;
  if (isVisible) buttonLabel = ar.auth.hidePassword;

  return (
    <AuthInput
      {...props}
      type={isVisible ? 'text' : 'password'}
      autoCapitalize="none"
      spellCheck={false}
      suffix={
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          aria-label={buttonLabel}
          aria-pressed={isVisible}
          title={buttonLabel}
          className="shrink-0 rounded-sm text-muted focus-visible:outline-2 focus-visible:outline-brand"
        >
          <IconEye />
        </button>
      }
    />
  );
}
