/**
 * The centered card of Figma "تأكيد البريد" (70:1253) and "استعادة كلمة المرور" (70:1314):
 * bg/surface page, 520px bg/raised card, border/subtle, radius xl, 44 top / 44 sides / 36 bottom
 * padding, 18 gap, centered content. On small screens the card fills the width (not in Figma).
 */
export function AuthCard({ children }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface px-4 py-[60px]">
      <div className="flex w-full max-w-[520px] flex-col items-center gap-[18px] rounded-xl border border-border bg-raised px-6 pt-[43px] pb-[35px] text-center sm:px-[43px]">
        {children}
      </div>
    </main>
  );
}
