import { Logo } from '../../../components/layout/Logo.jsx';
import { ar } from '../../../locales/ar.js';

// Placeholder — the real home page (hero search, latest listings) is built with the browse step.
export default function HomePage() {
  return (
    <section className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <Logo size={96} decorative />
      <h1 className="text-display text-brand-text">{ar.app.name}</h1>
      <p className="text-body text-text-secondary">{ar.app.tagline}</p>
      <span className="rounded-full border-s-4 border-brand bg-surface py-1 ps-3 pe-4 text-body-sm">
        {ar.app.comingSoon}
      </span>
    </section>
  );
}
