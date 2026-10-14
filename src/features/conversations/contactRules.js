/**
 * Whether «تواصل مع البائع» is offered on a listing: to guests (as a login link) and to a
 * signed-in user who does not own it — never to admins (the project guide 6.16).
 *
 * @param {boolean} isAuthenticated
 * @param {{ id: string, roles: string[] } | null} user
 * @param {import('../../api/types.js').PropertyDetails} property
 */
export function canContactSeller(isAuthenticated, user, property) {
  if (!property.user) return false;
  if (!isAuthenticated) return true;
  const isUser = user?.roles.includes('User') && !user.roles.includes('Admin');
  return Boolean(isUser) && property.user.id !== user.id;
}
