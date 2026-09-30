import { MIN_IMAGES } from './constants.js';

// The owner's view of a listing (the project guide 6.8 "What the owner UI shows per state"): one state
// made from the sale status, the moderation status and whether it is active.

/**
 * @typedef {'published'|'paused'|'pending'|'rejected'|'sold'|'rented'} OwnerState
 */

/**
 * @param {{ propertyStatus: string, moderationStatus: string, isActive: boolean }} property
 * @returns {OwnerState}
 */
export function ownerStateOf(property) {
  if (property.propertyStatus === 'Sold') return 'sold';
  if (property.propertyStatus === 'Rented') return 'rented';
  if (property.moderationStatus === 'Rejected') return 'rejected';
  if (property.moderationStatus === 'Pending') return 'pending';
  if (!property.isActive) return 'paused';
  return 'published';
}

export const OWNER_STATE_LABELS = {
  published: 'منشور',
  paused: 'موقوف',
  pending: 'قيد المراجعة',
  rejected: 'مرفوض',
  sold: 'تم البيع',
  rented: 'تم التأجير',
};

/** Badge tone per state (Figma Badge 27:37: معتمد / قيد المراجعة / مرفوض / مباع). */
export const OWNER_STATE_TONES = {
  published: 'success',
  paused: 'neutral',
  pending: 'warning',
  rejected: 'danger',
  sold: 'neutral',
  rented: 'neutral',
};

/**
 * The three things a listing needs before an admin can see it.
 * @param {{ images: { isMainImage: boolean }[], hasOwnershipDocument: boolean }} property
 */
export function readinessOf(property) {
  const hasEnoughImages = property.images.length >= MIN_IMAGES;
  const hasMainImage = property.images.some((image) => image.isMainImage);
  const hasDocument = property.hasOwnershipDocument;
  return {
    hasEnoughImages,
    hasMainImage,
    hasDocument,
    isReady: hasEnoughImages && hasMainImage && hasDocument,
  };
}
