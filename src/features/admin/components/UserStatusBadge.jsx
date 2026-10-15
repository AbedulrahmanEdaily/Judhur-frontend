import { Badge } from '../../../components/ui/Badge.jsx';
import { ar } from '../../../locales/ar.js';

const text = ar.admin.users.badges;

/**
 * The account state — Figma «حالة» (82:955, the Badge tones): «مشرف» (info) for an admin,
 * «محظور» (danger) while banned, «غير مؤكد» (warning) before the email is confirmed, otherwise
 * «نشط» (success).
 *
 * @param {{ user: import('../../../api/types.js').AdminUser }} props
 */
export function UserStatusBadge({ user }) {
  if (user.isAdmin) return <Badge tone="info">{text.admin}</Badge>;
  if (user.bannedAtUtc) return <Badge tone="danger">{text.banned}</Badge>;
  if (!user.emailConfirmed) return <Badge tone="warning">{text.unconfirmed}</Badge>;
  return <Badge tone="success">{text.active}</Badge>;
}
