import { useState } from 'react';
import { IconEye } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import { ListingInput } from '../../properties/components/ListingInput.jsx';

/**
 * A password field in the profile's field style (Figma 79:1659) with the eye of the sign-in
 * forms (69:1247) at the end to show or hide it. Works with register().
 *
 * @param {import('react').ComponentProps<typeof ListingInput>} props
 */
export function ProfilePasswordInput(props) {
  const [isVisible, setIsVisible] = useState(false);

  let buttonLabel = ar.auth.showPassword;
  if (isVisible) buttonLabel = ar.auth.hidePassword;

  return (
    <ListingInput
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
          className="flex rounded-sm text-muted focus-visible:outline-2 focus-visible:outline-brand"
        >
          <IconEye />
        </button>
      }
    />
  );
}
