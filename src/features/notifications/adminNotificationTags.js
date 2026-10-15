/**
 * What an admin notification makes stale (the project guide 6.11): a listing entering the queue
 * changes the queue and the dashboard numbers, a new report the reports and the numbers. Null
 * for other types.
 *
 * @param {string} type
 */
export function adminNotificationTags(type) {
  if (type === 'PropertyPendingReview') return ['PendingProperties', 'AdminStats'];
  if (type === 'NewReport') return ['AdminReports', 'AdminStats'];
  return null;
}
