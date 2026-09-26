/**
 * The `?redirect=` target, only if it is a path inside this app (blocks open redirects such as
 * `//evil.example` or `https://…`).
 *
 * @param {string | null} value
 * @param {string} [fallback]
 */
export function safeRedirectPath(value, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  return value;
}

/**
 * `/login?redirect=<path>` for sending a guest to login and back.
 * @param {{ pathname: string, search: string, hash?: string }} location
 */
export function loginPathFor(location) {
  const from = `${location.pathname}${location.search}${location.hash ?? ''}`;
  return `/login?${new URLSearchParams({ redirect: from })}`;
}
