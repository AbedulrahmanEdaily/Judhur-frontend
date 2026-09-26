import { Logo } from './Logo.jsx';
import { ar } from '../../locales/ar.js';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-start lg:px-10">
        <div className="flex items-center gap-2.5">
          <Logo size={32} decorative />
          <div>
            <p className="text-title text-brand-text">{ar.app.name}</p>
            <p className="text-body-sm text-text-secondary">{ar.app.tagline}</p>
          </div>
        </div>
        <p className="text-caption text-muted">{ar.footer.rights(new Date().getFullYear())}</p>
      </div>
    </footer>
  );
}
