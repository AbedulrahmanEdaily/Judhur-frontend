# Backend requests

Contract gaps between this frontend and the backend. When one is done: mark it `done`, update section 6 of `CLAUDE.md`, then remove the UI workaround.

## 1. Allow guests to browse

- Status: open
- Why the frontend needs it: the design has a guest state that browses, searches, and opens listings. The whole Properties controller currently requires the `User` role (guests get `401`, admins `403`).
- Endpoint / change wanted: allow anonymous access on `GET /api/v1/Properties` and `GET /api/v1/Properties/{id}`. Decide separately whether admins may view listings (they must not _post_ them).
- Current workaround in the UI: browse/search/details are public routes; a guest who hits them sees a "log in to browse" prompt.

## 2. Point the confirmation email to the frontend

- Status: open
- Why the frontend needs it: the email link currently targets the backend's own `POST /confirm-email`, so clicking it does a `GET` and fails.
- Endpoint / change wanted: set `Frontend:ConfirmEmailUrl` to `http://localhost:5173/confirm-email` in development (and the deployed URL in production). The frontend page reads `userId` and `token` and posts them.
- Current workaround in the UI: none — the `/confirm-email` page is built against the contract; testing requires editing the link by hand.

## 3. Error code on non-validation ProblemDetails

- Status: open
- Why the frontend needs it: "email not confirmed" and "account locked" are both `403` on login and only distinguishable by the English `title`; the UI also can't show its own Arabic message per error.
- Endpoint / change wanted: an extension member on every non-validation ProblemDetails, e.g. `"code": "Identity.EmailNotConfirmed"`, `"Identity.LockedOut"`, `"PropertyErrors.NotFound"`.
- Current workaround in the UI: branch on `status` only; on login `403` show the server `title` plus a "resend confirmation email" link.

## 4. Current user endpoint

- Status: open
- Why the frontend needs it: the header, dashboard, and profile page need the user's name, avatar, phone, etc. The JWT has only `sub`, `email`, and roles.
- Endpoint / change wanted: `GET /api/Identity/Account/me` (authenticated) → `{ id, fullName, email, phoneNumber, city, bio, profileImageUrl, roles }`.
- Current workaround in the UI: the header shows the email from the token.

## 5. Arabic messages for account endpoints

- Status: open
- Why the frontend needs it: the UI is Arabic only; account validators and identity errors are English (property endpoints are already Arabic).
- Endpoint / change wanted: Arabic messages for all `/api/Identity/Account/*` validation and identity errors.
- Current workaround in the UI: client-side zod validation with Arabic messages makes server validation errors rare; server messages are shown as they come.

## 6. Register ignores `bio` and `profileImageUrl`

- Status: open
- Why the frontend needs it: the register request accepts both fields but never saves them.
- Endpoint / change wanted: persist `bio` and `profileImageUrl` from `POST /register`.
- Current workaround in the UI: no UI depends on them persisting.

## 7. Richer search results

- Status: open
- Why the frontend needs it: search summaries have no image, created date, or coordinates, so cards use a placeholder image and there's no "map of results" view.
- Endpoint / change wanted: add `mainImageUrl` and `createdAtUtc` to the `GET /api/v1/Properties` item shape; add `latitude`/`longitude` if a results map is wanted.
- Current workaround in the UI: placeholder image on cards; no results map.

## 8. Owner details endpoint

- Status: open
- Why the frontend needs it: an owner can't open their own `Pending`/`Rejected` listing — the public details endpoint returns `404` for those.
- Endpoint / change wanted: e.g. `GET /api/v1/Properties/mine/{propertyId}` returning the details shape plus `moderationStatus`, `rejectionReason`, `isActive`, `createdAtUtc`.
- Current workaround in the UI: owners see those listings only as rows in `/my-properties`.

## 9. Currency

- Status: open
- Why the frontend needs it: `price` has no currency.
- Endpoint / change wanted: decide one fixed currency, or add a `currency` field (e.g. `ILS` / `USD` / `JOD`) to create, details, and summaries.
- Current workaround in the UI: a single `DEFAULT_CURRENCY = 'ILS'` constant in `src/lib/format.js`.

## 10. CORS for deployment

- Status: open
- Why the frontend needs it: development goes through the Vite proxy, but a deployed frontend on another origin will be blocked.
- Endpoint / change wanted: a CORS policy allowing the frontend origin, the `Authorization` header, and `Content-Type`.
- Current workaround in the UI: Vite dev proxy on `/api`.

## 11. Image and document upload (Cloudinary)

- Status: open
- Why the frontend needs it: listings have no images, and approval will require at least 3; the ownership document is a plain URL string.
- Endpoint / change wanted: upload endpoints for property images and the ownership document, and image URLs on details/summaries.
- Current workaround in the UI: temporary URL field for the ownership document; images section in "قريباً" state.

## 12. Everything in CLAUDE.md section 6.5

- Status: open
- Why the frontend needs it: profile, Google sign-in, listing edit/deactivate/delete, admin moderation, favorites, messaging, reviews, reports, notifications, AI price estimate.
- Endpoint / change wanted: requested one feature at a time, as its own entry, when the UI reaches it.
- Current workaround in the UI: those screens are not built, or show a "قريباً" state.
