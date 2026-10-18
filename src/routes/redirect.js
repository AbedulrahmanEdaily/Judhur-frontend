function withoutControlCharacters(value) {
  let cleaned = '';
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code > 31 && code !== 127) cleaned += character;
  }
  return cleaned;
}

/**
 * The `?redirect=` target, only if it is a path inside this app (blocks open redirects such as
 * `//evil.example`, `/\\evil.example` or `https://…`, also when hidden behind control characters).
 *
 * @param {string | null} value
 * @param {string} [fallback]
 */
export function safeRedirectPath(value, fallback = '/') {
  if (!value) return fallback;
  const path = withoutControlCharacters(value);
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return fallback;
  return path;
}

/**
 * `/login?redirect=<path>` for sending a guest to login and back.
 * @param {{ pathname: string, search: string, hash?: string }} location
 */
export function loginPathFor(location) {
  const from = `${location.pathname}${location.search}${location.hash ?? ''}`;
  return `/login?${new URLSearchParams({ redirect: from })}`;
}
