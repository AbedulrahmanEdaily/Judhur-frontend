# Backend requests

Contract gaps between this frontend and the backend. When one is done: mark it `done`, update section 6 of `CLAUDE.md`, then remove the UI workaround.

Statuses last updated from the backend contract of 2026-09-30.

## 1. Allow guests to browse

- Status: done
- Why the frontend needs it: the design has a guest state that browses, searches, and opens listings.
- Endpoint / change wanted: anonymous access on search and details. Done: `GET /api/v1/User/Properties` and `GET /api/v1/User/Properties/{id}` are open to guests, users, and admins.
- Current workaround in the UI: none (no "log in to browse" prompt).

## 2. Point the confirmation email to the frontend

- Status: done
- Why the frontend needs it: the email link used to target the backend's own `POST /confirm-email`, so clicking it did a `GET` and failed.
- Endpoint / change wanted: `Frontend:ConfirmEmailUrl`. Done: it points to `http://localhost:5173/confirm-email` in development.
- Current workaround in the UI: none.

## 3. Error code on non-validation ProblemDetails

- Status: done
- Why the frontend needs it: "email not confirmed" and "account locked" are both `403` on login and only distinguishable by the `title`; the UI also can't choose its own message per error.
- Endpoint / change wanted: done — every `401` / `403` / `404` / `409` ProblemDetails carries a top-level `code` (`Identity.EmailNotConfirmed`, `Identity.LockedOut`, `Identity.DuplicateEmail`, `Identity.ConcurrencyFailure`, …) (`CLAUDE.md` 6.2).
- Current workaround in the UI: none — login shows the resend link only for `Identity.EmailNotConfirmed`.

## 4. Current user endpoint

- Status: done
- Why the frontend needs it: the header, dashboard, and profile page need the user's name, avatar, phone, etc. The JWT has only `sub`, `email`, and roles.
- Endpoint / change wanted: done — `GET /api/Identity/Account/me` → `MyProfile` (with `hasPassword` and `createdAtUtc`), plus `PUT /me`, the photo and the password endpoints (`CLAUDE.md` 6.12).
- Current workaround in the UI: none — the header shows the name and photo (the email only until the profile loads).

## 5. Arabic messages for account endpoints

- Status: done
- Why the frontend needs it: the UI is Arabic only.
- Endpoint / change wanted: Arabic messages for all `/api/Identity/Account/*` errors. Done: every validation and identity message is Arabic, including validation titles.
- Current workaround in the UI: none. (Client-side zod validation stays — it is form UX, not a workaround.)

## 6. Register ignores `bio` and `profileImageUrl`

- Status: done
- Why the frontend needs it: the register request accepts both fields but never saves them.
- Endpoint / change wanted: done another way — register no longer takes `profileImageUrl`; the bio is edited with `PUT /me` and the photo uploaded with `PUT /me/photo` (`CLAUDE.md` 6.12).
- Current workaround in the UI: none.

## 7. Richer search results

- Status: partly done
- Why the frontend needs it: cards need an image and a date; the map page (`/map`, Figma 71:1300) needs every result's coordinates to place its pin.
- Endpoint / change wanted: done — `mainImageUrl` on every `PropertySummary`. Still missing on the `GET /api/v1/User/Properties` item shape (and the favorites list, same shape):
  - `latitude: number`, `longitude: number` — the values already stored for each listing.
  - `createdAtUtc: string` for the card date.
  - Optional, for later: `landClassification` (the map list shows its badge), and a bounding-box filter (`minLatitude`, `maxLatitude`, `minLongitude`, `maxLongitude`) so the map can show "the listings in this area" while the user pans.
- Current workaround in the UI: no date on cards. The map page reads each result's location (and land class) from `GET /User/Properties/{id}` — 12 extra requests per page, server-cached. Once the summaries carry the coordinates, that query is dropped.

## 8. Owner details endpoint

- Status: done
- Why the frontend needs it: an owner must open their own `Pending`/`Rejected` listing.
- Endpoint / change wanted: done — `GET /api/v1/User/Properties/mine/{propertyId}`.
- Current workaround in the UI: none.

## 9. Currency

- Status: open
- Why the frontend needs it: `price` has no currency.
- Endpoint / change wanted: decide one fixed currency, or add a `currency` field (e.g. `ILS` / `USD` / `JOD`) to create, details, and summaries.
- Current workaround in the UI: a single `DEFAULT_CURRENCY = 'ILS'` constant in `src/lib/format.js`.

## 10. CORS for deployment

- Status: partly done
- Why the frontend needs it: a deployed frontend on another origin will be blocked.
- Endpoint / change wanted: done — `http://localhost:5173` is allowed. Still missing — the deployed frontend origin, with the `Authorization` header and `Content-Type`.
- Current workaround in the UI: the Vite dev proxy on `/api` (still the default in development).

## 11. Image and document upload

- Status: done
- Why the frontend needs it: approval requires at least 3 images and an ownership document.
- Endpoint / change wanted: done — image upload/delete/set-main and a private ownership-document upload (`CLAUDE.md` 6.7). `ownershipDocumentUrl` is no longer part of create.
- Current workaround in the UI: none (the temporary document URL field and the images "قريباً" state are dropped from the plan).

## 12. Everything in CLAUDE.md section 6.14

- Status: partly done
- Why the frontend needs it: profile, Google sign-in, notifications, messaging, reviews, reports, AI price estimate, admin statistics and user management.
- Endpoint / change wanted: done — listing edit/deactivate/delete/sold/rented, admin moderation, favorites, notifications (`CLAUDE.md` 6.11), my profile (6.12), the public seller page (6.13). The rest is requested one feature at a time, as its own entry, when the UI reaches it.
- Current workaround in the UI: those screens are not built.

## 13. Register without a user name

- Status: done
- Why the frontend needs it: the sign-up design (Figma 69:1262) has no user-name field — only full name, email, phone, city, and password.
- Endpoint / change wanted: done — `userName` is gone from `POST /register`; the email is the login, and a duplicate is `409` `Identity.DuplicateEmail`.
- Current workaround in the UI: none.

## 14. Password reset by link or by code

- Status: open
- Why the frontend needs it: the forgot-password design (Figma 70:1314) says a secure **link** is emailed («أرسل رابط الاستعادة»), but the API emails a 6-digit **code**.
- Endpoint / change wanted: decide one. Either email a link to `/reset-password?email=…&code=…`, or keep the code and the design copy gets updated.
- Current workaround in the UI: the Figma copy is kept word for word; the next page (`/reset-password`, not in Figma) asks for the code.

## 15. `requestId` on every ProblemDetails

- Status: done — every ProblemDetails, `400` and framework-generated ones included, carries `instance` (`"<METHOD> <path>"`), `requestId` and an Arabic `title`
- Why the frontend needs it: a `500` screen shows the `requestId` so a failure can be reported. The contract of 2026-09-25 put `requestId` (and `instance`) on every error body; the examples in the contract of 2026-09-30 leave them out.
- Endpoint / change wanted: confirm that every ProblemDetails, the `400` validation body included, still carries `requestId`.
- Current workaround in the UI: none — the `500` error screens show the `requestId`.

## 16. Several values per search filter

- Status: done — `city`, `propertyType`, `propertyStatus`, `paymentType`, `landClassification` and `legalStatus` take repeated values (OR inside one filter, AND between filters); at most 20 cities, else `400` `PropertyErrors.TooManyCitiesInFilter`; an invalid enum value is a `400`
- Why the frontend needs it: the search filters in Figma (52:865) are checkboxes, so a buyer can pick several property types, land classes, or document types at once (for example «أرض» and «شقة», or «منطقة أ» and «منطقة ب»).
- Endpoint / change wanted: `GET /api/v1/User/Properties` accepting repeated values for `propertyType`, `landClassification`, and `legalStatus` (e.g. `?propertyType=Land&propertyType=Apartment&landClassification=A&landClassification=B`), matching any value inside one filter and all filters together (type IN (…) AND class IN (…) AND document IN (…)). No comma-separated form — each value is its own parameter.
- Current workaround in the UI: none — the city, type, payment, land-class and document checkboxes send one repeated parameter per ticked value; the purpose stays one choice.
