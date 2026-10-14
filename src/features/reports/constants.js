// Report enums from the API (the project guide 6.15) and their fixed Arabic labels.

/** @type {import('../../api/types.js').ReportReason[]} */
export const REPORT_REASONS = [
  'Fraud',
  'IncorrectInformation',
  'Duplicate',
  'InappropriateContent',
  'Other',
];

export const REPORT_REASON_LABELS = {
  Fraud: 'احتيال',
  IncorrectInformation: 'معلومات غير صحيحة',
  Duplicate: 'إعلان مكرر',
  InappropriateContent: 'محتوى غير لائق',
  Other: 'سبب آخر',
};

// Figma reason pill (82:1161): danger for the serious ones, warning for wrong data, neutral else.
export const REPORT_REASON_TONES = {
  Fraud: 'danger',
  IncorrectInformation: 'warning',
  Duplicate: 'warning',
  InappropriateContent: 'danger',
  Other: 'neutral',
};

/** @type {import('../../api/types.js').ReportStatus[]} */
export const REPORT_STATUSES = ['Pending', 'Resolved', 'Dismissed'];

export const REPORT_STATUS_LABELS = {
  Pending: 'قيد المراجعة',
  Resolved: 'تم اتخاذ إجراء',
  Dismissed: 'لا توجد مخالفة',
};

export const REPORT_STATUS_TONES = {
  Pending: 'warning',
  Resolved: 'success',
  Dismissed: 'neutral',
};

// API limits (the project guide 6.15).
export const MAX_REPORT_DETAILS_LENGTH = 1000;
export const MAX_ADMIN_NOTE_LENGTH = 1000;
export const MAX_SUSPENSION_REASON_LENGTH = 500;
