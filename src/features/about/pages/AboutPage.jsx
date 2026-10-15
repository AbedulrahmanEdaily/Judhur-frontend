import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import {
  IconWhyClassification,
  IconWhyDocument,
  IconWhyPhotos,
} from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import { selectIsAdmin } from '../../auth/authSlice.js';

const text = ar.about;
const home = ar.home;

// The three points of the home page's «لماذا جذور» (51:776), same icons and words.
const reasons = [
  {
    Icon: IconWhyClassification,
    title: home.whyClassificationTitle,
    body: home.whyClassificationText,
  },
  { Icon: IconWhyDocument, title: home.whyDocumentTitle, body: home.whyDocumentText },
  { Icon: IconWhyPhotos, title: home.whyPhotosTitle, body: home.whyPhotosText },
];

const cardClasses = 'flex flex-col gap-3 rounded-lg border border-border bg-raised p-5 xl:p-6';
const sectionTitleClasses = 'text-[20px] leading-[1.72] font-bold text-text xl:text-[23px]';
const primaryLinkClasses =
  'rounded-md bg-brand px-[21px] py-[11px] text-[15px] leading-[1.72] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';
const secondaryLinkClasses =
  'rounded-md border border-border-strong bg-surface px-[21px] py-[11px] text-[15px] leading-[1.72] font-semibold text-text transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/** A numbered list of steps in a card, for buyers or for sellers. */
function renderSteps(title, steps) {
  return (
    <div className={cardClasses}>
      <h3 className="text-[16px] leading-[1.72] font-bold text-text">{title}</h3>
      <ol className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-[13px] font-bold text-brand-text">
              {index + 1}
            </span>
            <span className="pt-0.5 text-[14px] leading-[1.75] text-text-secondary">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * `/about` — «عن جذور» (no Figma frame; built from the home page's «لماذا جذور» (51:776), the
 * card, heading and button styles). What Judhur is, «كيف بتشتغل» (`#how-it-works`) for buyers
 * and sellers, «الأسئلة الشائعة» (`#faq`, native details / summary) and how to reach the team.
 * Every answer follows the API contract. The footer links to the three parts.
 */
export default function AboutPage() {
  const isAdmin = useSelector(selectIsAdmin);

  return (
    <div className="flex flex-col bg-surface">
      <section className="flex flex-col items-center gap-3 bg-bg px-4 py-10 text-center xl:px-[120px] xl:py-14">
        <h1 className="text-[26px] leading-[1.6] font-bold text-text xl:text-[34px]">
          {text.title}
        </h1>
        <p className="max-w-[720px] text-[15px] leading-[1.8] text-text-secondary xl:text-[16px]">
          {text.intro}
        </p>
        <p className="max-w-[720px] text-[13.5px] leading-[1.8] text-muted">{text.project}</p>
      </section>

      <div className="flex flex-col gap-10 px-4 py-8 xl:gap-14 xl:px-[120px] xl:py-12">
        <section aria-labelledby="about-why" className="flex flex-col gap-4">
          <h2 id="about-why" className={sectionTitleClasses}>
            {text.whyTitle}
          </h2>
          <ul className="grid gap-3.5 xl:grid-cols-3 xl:gap-5">
            {reasons.map(({ Icon, title, body }) => (
              <li key={title} className={cardClasses}>
                <span className="self-start rounded-full bg-brand-subtle p-2.5 text-brand-text">
                  <Icon />
                </span>
                <h3 className="text-[16px] leading-[1.72] font-bold text-text">{title}</h3>
                <p className="text-[13.5px] leading-[1.75] text-text-secondary">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="how-it-works"
          aria-labelledby="about-how"
          className="flex scroll-mt-24 flex-col gap-4"
        >
          <h2 id="about-how" className={sectionTitleClasses}>
            {text.howTitle}
          </h2>
          <div className="grid gap-3.5 xl:grid-cols-2 xl:gap-5">
            {renderSteps(text.buyersTitle, text.buyerSteps)}
            {renderSteps(text.sellersTitle, text.sellerSteps)}
          </div>
        </section>

        <section id="faq" aria-labelledby="about-faq" className="flex scroll-mt-24 flex-col gap-4">
          <h2 id="about-faq" className={sectionTitleClasses}>
            {text.faqTitle}
          </h2>
          <div className="divide-y divide-border rounded-lg border border-border bg-raised">
            {text.faq.map(({ question, answer }) => (
              <details key={question} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center gap-3 rounded-sm text-[15px] leading-[1.72] font-semibold text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
                  <span className="flex-1">{question}</span>
                  <span
                    aria-hidden="true"
                    className="text-[18px] leading-none text-muted transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pt-2 text-[14px] leading-[1.8] text-text-secondary">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="about-contact" className={cardClasses}>
          <h2 id="about-contact" className="text-[18px] leading-[1.72] font-bold text-text">
            {text.contactTitle}
          </h2>
          <p className="text-[14px] leading-[1.8] text-text-secondary">
            {text.contactText}{' '}
            <a
              href={`mailto:${ar.footer.email}`}
              dir="ltr"
              className="rounded-sm font-semibold text-brand-text hover:underline focus-visible:outline-2 focus-visible:outline-brand"
            >
              {ar.footer.email}
            </a>
            {` — ${ar.footer.location}`}
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <Link to="/properties" className={primaryLinkClasses}>
              {text.browse}
            </Link>
            {!isAdmin && (
              <Link to="/properties/new" className={secondaryLinkClasses}>
                {ar.nav.addProperty}
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
