import { IconGoogle } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import { startGoogleReauth } from '../../auth/googleSignIn.js';

const text = ar.profile.reauth;

/** @param {{ action: string }} props */
export function GoogleReauthPrompt({ action }) {
  return (
    <div className="flex flex-col gap-3 rounded-md bg-inset px-3.5 py-3">
      <p className="text-[13px] leading-[1.78] text-text-secondary">{text.prompt}</p>
      <button
        type="button"
        onClick={() => startGoogleReauth(action)}
        className="flex items-center justify-center gap-2.5 self-start rounded-md border border-border-strong bg-bg px-[18px] py-2.5 text-[13.5px] leading-[1.72] font-semibold text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <IconGoogle className="shrink-0" />
        {text.confirm}
      </button>
    </div>
  );
}
