import { Link } from 'react-router';
import { ar } from '../../../locales/ar.js';

/** Not in Figma: built from the type scale and the primary Button style (27:2). */
export default function NotFoundPage() {
  return (
    <section className="flex flex-col items-center gap-4 px-4 py-16 text-center">
      <p className="text-display text-brand-text" aria-hidden="true">
        {ar.notFound.code}
      </p>
      <h1 className="text-h2 text-text">{ar.notFound.title}</h1>
      <p className="max-w-md text-body-md text-text-secondary">{ar.notFound.description}</p>
      <Link
        to="/"
        className="mt-2 rounded-md bg-brand px-[22px] py-3 text-[15px] leading-[1.6] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {ar.common.backHome}
      </Link>
    </section>
  );
}
