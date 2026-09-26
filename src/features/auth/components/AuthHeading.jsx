/** Title + subtitle at the top of an auth card. */
export function AuthHeading({ title, subtitle }) {
  return (
    <div className="mb-6 flex flex-col gap-1 text-center">
      <h1 className="text-h2 text-text">{title}</h1>
      {subtitle && <p className="text-body-md text-text-secondary">{subtitle}</p>}
    </div>
  );
}
