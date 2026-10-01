import { Spinner } from '../../../components/ui/Spinner.jsx';

/**
 * Figma «احفظ» (79:1699): brand, 30×14, radius md, 15/1.72 semibold, at the end of its row (left in RTL).
 * Disabled with a spinner while the form is sent, so it can't be sent twice. `form` names the
 * form when the button sits outside it.
 *
 * @param {{ form?: string, loading?: boolean, children: import('react').ReactNode }} props
 */
export function ProfileSubmitButton({ form, loading = false, children }) {
  return (
    <button
      type="submit"
      form={form}
      disabled={loading}
      aria-busy={loading || undefined}
      className="inline-flex items-center justify-center gap-2 self-end rounded-md bg-brand px-[30px] py-[14px] text-[15px] leading-[1.72] font-semibold whitespace-nowrap text-inverse transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}
