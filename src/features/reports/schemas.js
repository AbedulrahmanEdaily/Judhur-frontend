import { z } from 'zod';
import { ar } from '../../locales/ar.js';
import {
  MAX_ADMIN_NOTE_LENGTH,
  MAX_REPORT_DETAILS_LENGTH,
  MAX_SUSPENSION_REASON_LENGTH,
  REPORT_REASONS,
} from './constants.js';

// Mirror the backend rules of the report endpoints (the project guide 6.15). The server stays the
// authority. Empty optional text becomes null, as the API wants.

const reportMessages = ar.reports.validation;
const decisionMessages = ar.admin.reports.validation;

/** `POST /User/Reports`: a reason, and details (≤ 1000) that are required for «سبب آخر». */
export const reportSchema = z
  .object({
    reason: z.enum(REPORT_REASONS, { error: reportMessages.reasonRequired }),
    details: z.string().trim().max(MAX_REPORT_DETAILS_LENGTH, reportMessages.detailsTooLong),
  })
  .superRefine((values, context) => {
    if (values.reason === 'Other' && values.details === '') {
      context.addIssue({
        code: 'custom',
        path: ['details'],
        message: reportMessages.detailsRequired,
      });
    }
  })
  .transform((values) => {
    let details = null;
    if (values.details !== '') details = values.details;
    return { reason: values.reason, details };
  });

/**
 * The admin's decision on a report: «ملاحظة للمبلّغ» (optional, ≤ 1000) and, when suspending,
 * the reason shown to the owner (required, ≤ 500).
 *
 * @param {boolean} needsSuspensionReason
 */
export function reportDecisionSchema(needsSuspensionReason) {
  let suspensionReason = z.string().trim();
  if (needsSuspensionReason) {
    suspensionReason = suspensionReason
      .min(1, decisionMessages.suspensionRequired)
      .max(MAX_SUSPENSION_REASON_LENGTH, decisionMessages.suspensionTooLong);
  }

  return z
    .object({
      adminNote: z.string().trim().max(MAX_ADMIN_NOTE_LENGTH, decisionMessages.noteTooLong),
      suspensionReason,
    })
    .transform((values) => {
      let adminNote = null;
      if (values.adminNote !== '') adminNote = values.adminNote;
      return { adminNote, suspensionReason: values.suspensionReason };
    });
}
