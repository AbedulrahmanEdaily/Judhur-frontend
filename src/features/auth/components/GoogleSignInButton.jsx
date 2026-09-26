import { Badge } from '../../../components/ui/Badge.jsx';
import { buttonClasses } from '../../../components/ui/buttonStyles.js';
import { ar } from '../../../locales/ar.js';

/** Google sign-in is planned but not available on the backend yet. */
export function GoogleSignInButton() {
  return (
    <>
      <button
        type="button"
        disabled
        className={buttonClasses({ variant: 'secondary', fullWidth: true, className: 'gap-3' })}
      >
        {ar.auth.google}
        <Badge tone="neutral">{ar.app.comingSoon}</Badge>
      </button>
      <div className="my-5 flex items-center gap-3 text-caption text-muted">
        <span className="h-px flex-1 bg-border" />
        {ar.auth.or}
        <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
}
