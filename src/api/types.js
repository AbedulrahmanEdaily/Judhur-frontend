// JSDoc types mirroring the backend contract. Keep in sync with the API — change this file
// in the same commit as any contract change. Null properties are omitted by the API, so
// optional keys may be missing.

/**
 * @typedef {'Apartment'|'House'|'Land'|'Office'|'Storage'|'Building'} PropertyType
 * @typedef {'ForSale'|'ForRent'|'Sold'|'Rented'} PropertyStatus
 * @typedef {'Cash'|'Installments'|'DownPaymentAndInstallments'|'Negotiable'} PaymentType
 * @typedef {'A'|'B'|'C'} LandClassification
 * @typedef {'Tabo'|'Maliye'|'Taswiye'} LegalStatus
 * @typedef {'Pending'|'Approved'|'Rejected'} ModerationStatus
 * @typedef {'User'|'Admin'} Role
 */

// ---------------------------------------------------------------------------
// Account — /api/Identity/Account
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} TokenResponse
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {string} expiresOnUtc ISO-8601 with offset
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} userName
 * @property {string} fullName
 * @property {string} email
 * @property {string} phoneNumber
 * @property {string} city
 * @property {string | null} bio accepted but not saved yet
 * @property {string | null} profileImageUrl accepted but not saved yet
 * @property {string} password
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} ConfirmEmailRequest
 * @property {string} userId
 * @property {string} token
 */

/**
 * @typedef {Object} EmailRequest Body of /resend-confirmation and /send-reset-password-code.
 * @property {string} email
 */

/**
 * @typedef {Object} ChangePasswordRequest Reset password with the emailed code.
 * @property {string} email
 * @property {string} code 6 digits
 * @property {string} password
 */

/**
 * @typedef {Object} RefreshTokenRequest
 * @property {string} refreshToken
 * @property {string} expiredAccessToken
 */

/**
 * @typedef {Object} LogoutRequest
 * @property {string} refreshToken
 */

// ---------------------------------------------------------------------------
// Properties — /api/v1/Properties
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} PropertySummary Item of `GET /` (search).
 * @property {string} id
 * @property {string} title
 * @property {number} price
 * @property {PaymentType} paymentType
 * @property {PropertyType} propertyType
 * @property {PropertyStatus} propertyStatus
 * @property {number} area
 * @property {string} city
 * @property {string} [region]
 */

/**
 * @typedef {Object} PropertySeller
 * @property {string} id
 * @property {string} fullName
 * @property {string} [phoneNumber]
 * @property {string} [profileImageUrl]
 */

/**
 * @typedef {Object} PropertyDetails `GET /{propertyId}`; `POST /` returns it without `user`.
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {number} price
 * @property {PaymentType} paymentType
 * @property {PropertyType} propertyType
 * @property {PropertyStatus} propertyStatus
 * @property {number} area
 * @property {string} city
 * @property {string} [region]
 * @property {string} fullAddress
 * @property {number} latitude
 * @property {number} longitude
 * @property {LandClassification} landClassification
 * @property {LegalStatus} legalStatus
 * @property {PropertySeller} [user]
 */

/**
 * @typedef {Object} MyProperty Item of `GET /mine` (plain array, not paginated).
 * @property {string} id
 * @property {string} title
 * @property {number} price
 * @property {PaymentType} paymentType
 * @property {PropertyType} propertyType
 * @property {PropertyStatus} propertyStatus
 * @property {number} area
 * @property {string} city
 * @property {string} [region]
 * @property {ModerationStatus} moderationStatus
 * @property {string} [rejectionReason] only when Rejected
 * @property {boolean} isActive
 * @property {string} createdAtUtc ISO-8601 with offset
 */

/**
 * @typedef {Object} CreatePropertyRequest Body of `POST /`.
 * @property {string} title
 * @property {string | null} description
 * @property {number} price
 * @property {PaymentType} paymentType
 * @property {PropertyType} propertyType
 * @property {'ForSale'|'ForRent'} propertyStatus
 * @property {number} area
 * @property {string} city
 * @property {string | null} region
 * @property {string} fullAddress
 * @property {number} latitude
 * @property {number} longitude
 * @property {LandClassification} landClassification
 * @property {LegalStatus} legalStatus
 * @property {string} ownershipDocumentUrl
 */

/**
 * @typedef {Object} PropertySearchParams Query of `GET /`. Omit empty values.
 * @property {number} [page]
 * @property {number} [pageSize]
 * @property {string} [searchTerm]
 * @property {string} [city]
 * @property {number} [minPrice]
 * @property {number} [maxPrice]
 * @property {PropertyType} [propertyType]
 * @property {'ForSale'|'ForRent'} [propertyStatus]
 * @property {PaymentType} [paymentType]
 * @property {LandClassification} [landClassification]
 * @property {LegalStatus} [legalStatus]
 * @property {'createdAt'|'price'|'city'|'landClassification'} [sortColumn]
 * @property {'asc'|'desc'} [sortDirection]
 */

/**
 * @template T
 * @typedef {Object} PaginatedList
 * @property {number} pageNumber
 * @property {number} pageSize
 * @property {number} totalPages
 * @property {number} totalCount
 * @property {T[]} [items]
 */

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ProblemDetails `application/problem+json` body.
 * @property {string} [type]
 * @property {string} [title] the human-readable message
 * @property {number} [status]
 * @property {string} [detail]
 * @property {Record<string, string[]>} [errors] validation errors (400)
 * @property {string} [instance]
 * @property {string} [requestId]
 */

export {};
