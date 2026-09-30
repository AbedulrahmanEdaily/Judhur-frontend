// API enum values with their Arabic labels (CLAUDE.md section 3). Never show a raw enum value.

// Figma lists land first (search filter 52:882, home categories 50:588).
export const PROPERTY_TYPES = ['Land', 'Apartment', 'House', 'Office', 'Storage', 'Building'];

export const PROPERTY_TYPE_LABELS = {
  Apartment: 'شقة',
  House: 'منزل',
  Land: 'أرض',
  Office: 'مكتب',
  Storage: 'مخزن',
  Building: 'عمارة',
};

// Plurals for titles and category cards. Figma has أراضي and شقق; the others are not in Figma.
export const PROPERTY_TYPE_PLURALS = {
  Apartment: 'شقق',
  House: 'منازل',
  Land: 'أراضي',
  Office: 'مكاتب',
  Storage: 'مخازن',
  Building: 'عمارات',
};

// Create and the search filter accept only these two.
export const LISTING_STATUSES = ['ForSale', 'ForRent'];

export const PROPERTY_STATUS_LABELS = {
  ForSale: 'للبيع',
  ForRent: 'للإيجار',
  Sold: 'تم البيع',
  Rented: 'تم التأجير',
};

/** Badge tone per status (Figma Badge 27:37). */
export const PROPERTY_STATUS_TONES = {
  ForSale: 'brand',
  ForRent: 'info',
  Sold: 'neutral',
  Rented: 'neutral',
};

export const PAYMENT_TYPES = ['Cash', 'Installments', 'DownPaymentAndInstallments', 'Negotiable'];

export const PAYMENT_TYPE_LABELS = {
  Cash: 'نقداً',
  Installments: 'تقسيط',
  DownPaymentAndInstallments: 'دفعة أولى وأقساط',
  Negotiable: 'قابل للتفاوض',
};

export const LAND_CLASSIFICATIONS = ['A', 'B', 'C'];

export const LAND_CLASSIFICATION_LABELS = {
  A: 'منطقة أ',
  B: 'منطقة ب',
  C: 'منطقة ج',
};

/** Figma Badge variants «تصنيف أ/ب/ج». */
export const LAND_CLASSIFICATION_BADGES = {
  A: 'تصنيف أ',
  B: 'تصنيف ب',
  C: 'تصنيف ج',
};

export const LAND_CLASSIFICATION_TONES = {
  A: 'land-a',
  B: 'land-b',
  C: 'land-c',
};

export const LEGAL_STATUSES = ['Tabo', 'Maliye', 'Taswiye'];

export const LEGAL_STATUS_LABELS = {
  Tabo: 'طابو',
  Maliye: 'مالية',
  Taswiye: 'تسوية',
};

/** Sort options: `value` is "<sortColumn>-<sortDirection>" as the API names them. */
export const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'الأحدث' },
  { value: 'createdAt-asc', label: 'الأقدم' },
  { value: 'price-asc', label: 'السعر: من الأقل' },
  { value: 'price-desc', label: 'السعر: من الأعلى' },
];

export const DEFAULT_SORT = 'createdAt-desc';

// The API has no list of cities; `city` is an exact match on what the seller typed.
// The first five are the Figma city cards (51:756); the rest are not in Figma.
export const CITIES = [
  'نابلس',
  'رام الله',
  'طولكرم',
  'جنين',
  'الخليل',
  'القدس',
  'بيت لحم',
  'قلقيلية',
  'سلفيت',
  'طوباس',
  'أريحا',
  'غزة',
];

export const SEARCH_PAGE_SIZE = 12;

// Price ranges of the home search bar — not in Figma (it shows only «أي سعر»).
export const HERO_PRICE_RANGES = [
  { minPrice: null, maxPrice: 50000 },
  { minPrice: 50000, maxPrice: 150000 },
  { minPrice: 150000, maxPrice: 300000 },
  { minPrice: 300000, maxPrice: null },
];

// Upload rules of the media endpoints (CLAUDE.md 6.7), checked before uploading.
export const IMAGE_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_IMAGES = 10;
export const DOCUMENT_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

// A Pending listing reaches the admin queue only with this many images, a main image and an
// ownership document (CLAUDE.md 6.8).
export const MIN_IMAGES = 3;
