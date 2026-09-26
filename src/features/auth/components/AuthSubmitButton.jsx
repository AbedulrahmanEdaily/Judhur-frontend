import { Spinner } from '../../../components/ui/Spinner.jsx';

/**
 * Full-width primary action of the auth screens (Figma 69:1257, 84:792): brand/solid, 15px
 * vertical padding, radius md; 15.5/1.75 semibold on desktop, 15/1.72 on mobile.
 */
export function AuthSubmitButton({ loading = false, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading || undefined}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand py-[15px] text-[15px] leading-[1.72] font-semibold text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60 xl:text-[15.5px] xl:leading-[1.75]"
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}
