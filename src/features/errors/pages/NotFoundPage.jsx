import { Link } from 'react-router';
import { House } from 'lucide-react';
import { buttonClasses } from '../../../components/ui/buttonStyles.js';
import { ar } from '../../../locales/ar.js';

export default function NotFoundPage() {
  return (
    <section className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-display text-brand-text" aria-hidden="true">
        {ar.notFound.code}
      </p>
      <h1 className="text-h2 text-text">{ar.notFound.title}</h1>
      <p className="max-w-md text-body-md text-text-secondary">{ar.notFound.description}</p>
      <Link to="/" className={buttonClasses({ className: 'mt-2' })}>
        <House size={18} aria-hidden="true" />
        {ar.common.backHome}
      </Link>
    </section>
  );
}
