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
// Shared shapes (the project guide 6.4)
// ---------------------------------------------------------------------------

/**
 * @template T
 * @typedef {Object} PaginatedList
 * @property {number} pageNumber
 * @property {number} pageSize
 * @property {number} totalPages
 * @property {number} totalCount
 * @property {T[]} items
 */

/**
 * @typedef {Object} PropertyImage Arrays of images are sorted by `displayOrder`.
 * @property {string} id
 * @property {string} url
 * @property {number} displayOrder
 * @property {boolean} isMainImage exactly one per non-empty list
 */

/**
 * @typedef {Object} UserInfo The seller.
 * @property {string} id
 * @property {string} fullName
 * @property {string} [phoneNumber] only when the request carries a valid token
 * @property {string} [profileImageUrl]
 */

/**
 * @typedef {Object} PropertySummary Item of search and of the favorites list (same card).
 * @property {string} id
 * @property {string} title
 * @property {number} price
 * @property {PaymentType} paymentType
 * @property {PropertyType} propertyType
 * @property {PropertyStatus} propertyStatus
 * @property {number} area
 * @property {string} city
 * @property {string} [region]
 * @property {string} [mainImageUrl] missing if the listing has no main image
 */

// ---------------------------------------------------------------------------
// Public properties — /api/v1/User/Properties (the project guide 6.5)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} PropertySearchParams Query of `GET /`. Omit empty values. The list filters
 *   repeat their name once per value (`city=نابلس&city=جنين`): OR inside one filter, AND between
 *   filters. At most 20 cities (`PropertyErrors.TooManyCitiesInFilter`).
 * @property {number} [page]
 * @property {number} [pageSize]
 * @property {string} [searchTerm]
 * @property {string[]} [city]
 * @property {number} [minPrice]
 * @property {number} [maxPrice]
 * @property {PropertyType[]} [propertyType]
 * @property {('ForSale'|'ForRent')[]} [propertyStatus] the UI sends one value
 * @property {PaymentType[]} [paymentType]
 * @property {LandClassification[]} [landClassification]
 * @property {LegalStatus[]} [legalStatus]
 * @property {'createdAt'|'price'|'city'|'landClassification'} [sortColumn]
 * @property {'asc'|'desc'} [sortDirection]
 */

/**
 * @typedef {Object} PropertyDetails `GET /{propertyId}`. `POST /` returns it with
 *   `images: []` and without `user`.
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
 * @property {UserInfo} [user]
 * @property {PropertyImage[]} images
 */

// ---------------------------------------------------------------------------
// Seller — /api/v1/User/Properties (the project guide 6.6–6.8)
// ---------------------------------------------------------------------------

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
 * @property {string} [mainImageUrl]
 */

/**
 * @typedef {Object} MyPropertyDetails `GET /mine/{propertyId}` — any moderation state.
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
 * @property {boolean} hasOwnershipDocument the document itself is never returned to the owner
 * @property {ModerationStatus} moderationStatus
 * @property {string} [rejectionReason]
 * @property {string} [reviewedAtUtc]
 * @property {boolean} isActive
 * @property {string} createdAtUtc
 * @property {PropertyImage[]} images
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
 */

/**
 * @typedef {Object} UpdatePropertyDetailsRequest Body of `PUT /{propertyId}/details` — the
 *   create body without `description` and `propertyStatus`. Sends the listing back to Pending.
 * @property {string} title
 * @property {number} price
 * @property {PaymentType} paymentType
 * @property {PropertyType} propertyType
 * @property {number} area
 * @property {string} city
 * @property {string | null} region
 * @property {string} fullAddress
 * @property {number} latitude
 * @property {number} longitude
 * @property {LandClassification} landClassification
 * @property {LegalStatus} legalStatus
 */

/**
 * @typedef {Object} UpdatePropertyDescriptionRequest Body of `PUT /{propertyId}/description`.
 * @property {string | null} description
 */

// ---------------------------------------------------------------------------
// Admin moderation — /api/v1/Admin/Properties (the project guide 6.10)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} PendingProperty Item of `GET /pending` (oldest first).
 * @property {string} id
 * @property {string} title
 * @property {number} price
 * @property {PaymentType} paymentType
 * @property {PropertyType} propertyType
 * @property {string} city
 * @property {string} [region]
 * @property {string} [mainImageUrl]
 * @property {string} createdAtUtc
 */

/**
 * @typedef {Object} ReviewProperty `GET /{propertyId}` — any moderation state.
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
 * @property {ModerationStatus} moderationStatus
 * @property {string} [rejectionReason]
 * @property {string} [reviewedAtUtc]
 * @property {boolean} isActive
 * @property {string} createdAtUtc
 * @property {PropertyImage[]} images
 * @property {UserInfo} [seller] missing if the seller account no longer exists
 * @property {string} [ownershipDocumentUrl] signed link, valid for 10 minutes — never store it
 * @property {string} [ownershipDocumentExpiresAtUtc]
 */

/**
 * @typedef {Object} RejectPropertyRequest Body of `POST /{propertyId}/reject`.
 * @property {string} rejectionReason required, ≤500
 */

// ---------------------------------------------------------------------------
// Notifications — /api/v1/User/Notifications (any signed-in role)
// ---------------------------------------------------------------------------

/**
 * @typedef {'PropertyApproved'|'PropertyRejected'} NotificationType more types may come later
 *
 * @typedef {Object} Notification Item of `GET /` (newest first).
 * @property {string} id
 * @property {NotificationType | string} type
 * @property {string} title Arabic, shown as sent
 * @property {string} body Arabic, shown as sent
 * @property {string} [referenceId] the listing id for the property types
 * @property {boolean} isRead
 * @property {string} createdAtUtc ISO-8601 with offset
 *
 * @typedef {Object} UnreadCount `GET /unread-count`.
 * @property {number} count
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
 * @property {Record<string, string[]>} [errors] 400 only — keys are PascalCase request fields
 *   or `Group.Name` error codes
 * @property {string} [instance]
 * @property {string} [requestId]
 */

export {};
