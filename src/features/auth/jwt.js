import { jwtDecode } from 'jwt-decode';

// ASP.NET Core may emit the role under either key, as a string or an array.
const ROLE_CLAIMS = ['role', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

/** @typedef {{ id: string, email: string | null, roles: string[] }} SessionUser */

/**
 * Reads the user from the access token. Decoding only — the server does the validation.
 * @param {string} accessToken
 * @returns {SessionUser | null} null when the token can't be decoded
 */
export function userFromAccessToken(accessToken) {
  let claims;
  try {
    claims = jwtDecode(accessToken);
  } catch {
    return null;
  }
  if (!claims || typeof claims.sub !== 'string') return null;

  const rawRoles = ROLE_CLAIMS.map((key) => claims[key]).find((value) => value != null);
  const roles = rawRoles == null ? [] : [].concat(rawRoles).map(String);

  return { id: claims.sub, email: typeof claims.email === 'string' ? claims.email : null, roles };
}
