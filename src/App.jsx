import { ar } from './locales/ar.js';

// Temporary placeholder — replaced by the router in build step 3.
export default function App() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-4xl font-bold text-brand">{ar.app.name}</h1>
      <p className="text-muted">{ar.app.tagline}</p>
      <span className="rounded-full border-s-4 border-brand bg-surface ps-3 pe-4 py-1 text-sm">
        {ar.app.comingSoon}
      </span>
    </main>
  );
}
