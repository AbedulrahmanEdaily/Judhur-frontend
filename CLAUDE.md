# Judhur (جذور) — Frontend

> Project context for Claude Code working in the **frontend repository**. Read this whole file before writing code.
> The backend lives in a **separate repository** that you cannot see. Section 6 (API contract) is your only source of truth for the backend — never guess an endpoint, a field name, or a status code.
>
> Contract snapshot taken from backend commit `887f090` (2026-09-25).
>
> **Read DESIGN.md before any UI work; for anything visual it overrides this file.**

---

## 1. What we are building

Judhur is a Palestinian real estate marketplace — a graduation project (Palestine Technical University – Khaddouri) built by a team of three. Abdulrahman owns the backend (ASP.NET Core) and is building this frontend with you.

- People browse and search property listings (apartments, houses, land, offices, storage, buildings) for sale or rent.
- Any registered user can both buy and sell — there is **one unified user role** in the UI, not separate buyer/seller accounts.
- Every new listing starts **pending** and becomes public only after an admin approves it.
- Admins moderate; they never post listings themselves.

### Working mode — frontend and backend move together

Frontend and backend are developed **in parallel**. When the frontend needs something the backend doesn't offer yet, Abdulrahman changes the backend right away. Your job in that loop:

1. Never invent an endpoint, field, query parameter, or enum value that isn't in section 6.
2. When you need something missing, add an entry to `BACKEND_REQUESTS.md` at the repo root (format in section 13) and tell Abdulrahman in your reply.
3. Build the UI around the real contract. If a screen is blocked by a missing endpoint, build it with a clear disabled/"قريباً" state — no silent fake data.
4. When Abdulrahman says the backend changed, **update section 6 of this file first**, then change the code.

---

## 2. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Language | **JavaScript** (ES2022+, JSX) | No TypeScript. Use JSDoc typedefs for API shapes (section 7.2). |
| Build tool | Vite | `npm create vite@latest` → React + JavaScript template |
| UI | React | Function components + hooks only |
| Routing | React Router (data router: `createBrowserRouter` + `RouterProvider`) | |
| State | Redux Toolkit | Server state through **RTK Query**; slices only for client state |
| Forms | React Hook Form | Validation schemas with `zod` + `@hookform/resolvers/zod` (zod works fine in plain JS) |
| Styling | Tailwind CSS v4 with `@tailwindcss/vite` | CSS-first config, RTL, class-based dark mode |
| Maps | HERE Maps API for JavaScript (`@here/maps-api-for-javascript`) + HERE Geocoding & Search REST API | Section 10 |
| Font | Cairo | `@fontsource/cairo` (self-hosted) |
| Lint/format | ESLint (Vite default) + Prettier | |

Supporting packages you may add: `async-mutex` (token refresh lock — required), `clsx` (conditional classes), `jwt-decode` (read claims from the access token), an icon set such as `lucide-react`. Ask before adding anything heavier (component libraries, date libraries, i18n frameworks).

---

## 3. Language, direction, and copy rules

- **The UI is Arabic only and right-to-left.** `<html lang="ar" dir="rtl">` in `index.html`.
- **Code is English**: identifiers, file names, comments, commit messages.
- All user-facing text lives in `src/locales/ar.js` (one exported object, grouped by feature). No Arabic string literals scattered in components, so wording can be changed in one place.
- Numbers use **Latin digits** inside Arabic text. Use `Intl.NumberFormat('ar-u-nu-latn', …)` and `Intl.DateTimeFormat('ar-u-nu-latn', …)` — plain `'ar'` would output Arabic-Indic digits.
- Area is shown in square meters: `١٢٠ م²` style but with Latin digits → `120 م²`.
- **Currency is not in the API yet** (see `BACKEND_REQUESTS.md` seed entry). Use a single constant `DEFAULT_CURRENCY = 'ILS'` in `src/lib/format.js` and format through one function, so it's a one-line change later.
- Use Tailwind **logical** utilities so RTL works without mirroring by hand: `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end`, `border-s`/`border-e`, `rounded-s-*`/`rounded-e-*`. Avoid `ml/mr/pl/pr/left/right/text-left/text-right`.
- Directional icons (arrows, chevrons, "back") must point the right way in RTL — use `rtl:rotate-180` or pick the mirrored icon.

### Arabic labels for API enums

Enums arrive from the API as **strings** (section 6.1). Keep this mapping in `src/features/properties/constants.js` and never display a raw enum value.

| Enum | Value | Arabic label |
|---|---|---|
| PropertyType | `Apartment` | شقة |
| | `House` | منزل |
| | `Land` | أرض |
| | `Office` | مكتب |
| | `Storage` | مخزن |
| | `Building` | عمارة |
| PropertyStatus | `ForSale` | للبيع |
| | `ForRent` | للإيجار |
| | `Sold` | تم البيع |
| | `Rented` | تم التأجير |
| PaymentType | `Cash` | نقداً |
| | `Installments` | تقسيط |
| | `DownPaymentAndInstallments` | دفعة أولى وأقساط |
| | `Negotiable` | قابل للتفاوض |
| LandClassification | `A` | منطقة أ |
| | `B` | منطقة ب |
| | `C` | منطقة ج |
| LegalStatus | `Tabo` | طابو |
| | `Maliye` | مالية |
| | `Taswiye` | تسوية |
| ModerationStatus | `Pending` | قيد المراجعة |
| | `Approved` | منشور |
| | `Rejected` | مرفوض |

Confirm the exact wording with Abdulrahman once; after that treat this table as fixed.

---

## 4. Design system

The design lives in Figma: https://www.figma.com/design/voDthhA1bOmjcJgIkDDXqe
If the Figma MCP is available in your session, read variables and components from there; the Figma file wins over anything in this section.

### Decisions already made (do not re-open)

- Arabic, RTL, **light and dark modes**, full desktop **and** full mobile layouts.
- Brand color: **emerald green** — `#0F7A56` in light mode, `#22A473` in dark mode. Accent: **deep navy**.
- **Gold is reserved for one thing only**: the "موثّق" (verified) badge. Never use gold anywhere else.
- Typeface: **Cairo**.
- Logo: a circular crest (olive tree, small house with an arched door in the trunk, roots, double ring with a gold outer band). Export it from Figma as SVG into `src/assets/logo.svg`; do not redraw it.
- Four access states: **guest**, **user** (buys and sells), **user who has listings**, **admin**.
- A user with no listings sees a dashboard built around buyer value (search, saved/latest listings). The "My listings" section appears only after they add one — never show an empty seller dashboard.
- **Every destructive action** (delete a listing, delete an account, deactivate, logout from all…) goes through a confirmation dialog. Never fire it on the first click.
- Google sign-in is planned next to email sign-up (backend not ready yet).

### Tokens

Define colors as CSS variables and expose them to Tailwind with `@theme`. Pull exact values from Figma; the ones marked *placeholder* are only there so the app runs before you sync.

```css
/* src/styles/index.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --color-brand: #0F7A56;
  --color-accent: #1E2A4A;      /* placeholder — navy from Figma */
  --color-verified: #C9A227;    /* placeholder — gold from Figma, verified badge ONLY */
  --color-bg: #FFFFFF;          /* placeholder */
  --color-surface: #F6F8F7;     /* placeholder */
  --color-text: #111827;        /* placeholder */
  --color-muted: #6B7280;       /* placeholder */
  --color-danger: #DC2626;      /* placeholder */
}
.dark {
  --color-brand: #22A473;
  /* dark values of every token above — from Figma */
}

@theme inline {
  --color-brand: var(--color-brand);
  --color-accent: var(--color-accent);
  --color-verified: var(--color-verified);
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-text: var(--color-text);
  --color-muted: var(--color-muted);
  --color-danger: var(--color-danger);
  --font-sans: "Cairo", system-ui, sans-serif;
}
```

Components use the semantic names (`bg-surface`, `text-brand`, `text-muted`), never raw hex values.

**Theme switching:** the `dark` class on `<html>`. Initial value: saved preference in `localStorage` (`judhur.theme` = `light` | `dark`), else `prefers-color-scheme`. Keep the current theme in the `ui` slice and sync it to `<html>` in one effect. Wrap `localStorage` access in `try/catch`.

---

## 5. Local development setup

### Running the backend

The backend runs at **`https://localhost:7000`** (self-signed dev certificate). Swagger UI: `https://localhost:7000/swagger`. When in doubt about a shape, Swagger on the running backend is the tie-breaker — and if it disagrees with section 6, tell Abdulrahman.

### Vite dev proxy (no CORS needed in development)

The backend has **no CORS configuration**, so the browser can't call it directly from `http://localhost:5173`. In development, proxy `/api` through Vite so the browser only ever talks to its own origin:

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:7000',
        changeOrigin: true,
        secure: false, // backend uses a self-signed dev certificate
      },
    },
  },
});
```

### Environment variables

```
# .env.example  (commit this)
VITE_API_BASE_URL=          # empty in dev → same origin via the proxy; full URL in production
VITE_HERE_API_KEY=          # HERE platform API key
```

Real values go in `.env.local` (git-ignored). Read them only in `src/config/env.js` and import from there.

### Dev accounts

The backend seeds an admin and a normal user on startup. Get the credentials from Abdulrahman (they're in the backend's database initializer) — never commit them to this repo. Newly registered users must confirm their email before they can log in.

---

## 6. API contract

### 6.1 Global conventions

- **Base paths**
  - Account/auth: `/api/Identity/Account/...` (no version segment)
  - Properties: `/api/v1/Properties/...` (URL-segment versioning; always `v1` for now)
  - Paths are case-insensitive on the server; use exactly the casing shown here for consistency.
- **JSON**: camelCase property names. **Enums are strings** (`"ForSale"`, not `1`). **Null properties are omitted** from responses — treat a missing key as `null`.
- **IDs** are GUID strings. **Dates** are ISO-8601 with offset (`DateTimeOffset`). **Money and area** are JSON numbers (decimals).
- **Auth header**: `Authorization: Bearer <accessToken>`.
- **Roles** in the JWT: `User` or `Admin` (section 8.2).

### 6.2 Error format (ProblemDetails)

Every error is `application/problem+json`. Two shapes:

**Validation error — `400`** (FluentValidation, or domain rules that are all validation errors):

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Email": ["Email is not a valid email address"],
    "Password": ["Password must contain at least one digit"]
  },
  "instance": "POST /api/Identity/Account/register",
  "requestId": "0HN..."
}
```

- Keys under `errors` are **either a request property name in PascalCase** (`"Email"`, `"PhoneNumber"`, `"Price"`) **or an error code** (`"PropertyErrors.PageInvalid"`, `"Identity.PasswordTooShort"`, `"Identity.InvalidResetCode"`, `"Identity.InvalidConfirmationToken"`).
- Map to form fields by lower-casing the first letter of the key and matching a registered field name (`PhoneNumber` → `phoneNumber`). Anything that doesn't match a field becomes a **form-level** error message.
- Messages are Arabic for property endpoints and **currently English for account endpoints** (a backend fix is requested). Show them as they come — client-side validation (section 9) should make server validation errors rare.

**Any other error — `401` / `403` / `404` / `409` / `500`:**

```json
{
  "type": "...",
  "title": "العقار غير موجود",
  "status": 404,
  "instance": "GET /api/v1/Properties/…",
  "requestId": "0HN..."
}
```

- The **human-readable message is in `title`**, not `detail`.
- There is **no error code** on these responses yet (backend request #3 in section 13). Until it lands, branch on `status` only.
- Unhandled server errors: `500` with a generic `title` and a `detail`. Show a generic Arabic "حدث خطأ غير متوقع" plus the `requestId` (small, selectable text) so it can be reported.
- `409` can also come from a database uniqueness conflict, with an English generic `title`.
- `429 Too Many Requests` from rate-limited endpoints may have an empty body — always handle it by status.
- `401`/`403` produced by the auth middleware itself (missing/expired token, wrong role) may have an empty body or a bare ProblemDetails without a meaningful `title`.

Write one helper, `src/lib/http/problemDetails.js`, that turns any RTK Query error into `{ status, message, fieldErrors, requestId }`, and use it everywhere.

### 6.3 Account endpoints — `/api/Identity/Account`

All bodies are JSON. None of these require an `Authorization` header.

#### `POST /register`

```json
{
  "userName": "string (required, ≤256)",
  "fullName": "string (required, ≤150)",
  "email": "string (required, valid email, ≤256)",
  "phoneNumber": "string (required, see regex)",
  "city": "string (required, ≤100)",
  "bio": "string | null (≤1000)",
  "profileImageUrl": "string | null (≤500)",
  "password": "string (required, ≥8, one uppercase, one lowercase, one digit)"
}
```

- `201 Created`, **empty body**. The backend emails a confirmation link. Navigate to a "check your email" screen that offers "resend".
- `400` validation · `409` duplicate email or user name (message in `title`).
- Phone regex (Palestinian/Israeli mobile formats): `^(?:\+?(?:970|972)\d{9}|05\d{8})$`
- ⚠️ `bio` and `profileImageUrl` are accepted but **not saved** by the backend yet (backend request #6). Don't build UI that depends on them persisting.

#### `POST /login`

```json
{ "email": "string", "password": "string" }
```

- `200` → `TokenResponse`:
  ```json
  { "accessToken": "jwt", "refreshToken": "base64 string", "expiresOnUtc": "2026-09-25T12:30:00+00:00" }
  ```
- `401` wrong email or password.
- `403` **either** email not confirmed **or** account locked (5 failed attempts → locked for 5 minutes). Both are `403`; they're distinguishable only by the English `title` until backend request #3 lands. Until then, on `403` show the server message plus a "resend confirmation email" link.
- `400` validation.
- **Single session per user:** logging in issues a new refresh token and deletes every older one. Logging in on another device ends the session here on its next refresh (section 8.4).

#### `POST /confirm-email`

```json
{ "userId": "guid", "token": "string" }
```

- `204` confirmed · `400` link invalid or expired.
- The email contains a link `<ConfirmEmailUrl>?userId=<guid>&token=<url-encoded token>`. The frontend owns the page at **`/confirm-email`**: read both query params, `POST` them here, show success (→ login) or failure (→ "resend" form). ⚠️ The backend currently points that link at itself, not at the frontend (backend request #2).
- `URLSearchParams` already decodes the token — send it as read, do not decode twice.

#### `POST /resend-confirmation`

```json
{ "email": "string" }
```

- **Always `204`**, whether or not the email exists (prevents probing which emails have accounts). Show the same neutral message in every case.
- Rate limit: **3 requests / 15 minutes / IP** → `429`.

#### `POST /send-reset-password-code`

```json
{ "email": "string" }
```

- **Always `204`**. If the account exists, a **6-digit code** is emailed, valid for **5 minutes**.
- Rate limit: **3 / 15 min / IP** → `429`.

#### `POST /change-password`  (reset password with the emailed code)

```json
{ "email": "string", "code": "string (6 digits)", "password": "string (same rules as register)" }
```

- `204` success → go to login · `400` wrong or expired code (`errors["Identity.InvalidResetCode"]`) or password rules.
- Rate limit: **5 / 15 min / IP** → `429`.
- Flow: `/forgot-password` (email) → `/reset-password?email=…` (code + new password). Show a 5-minute countdown and a "send a new code" button.

#### `POST /refresh-token`

```json
{ "refreshToken": "string", "expiredAccessToken": "string" }
```

- `200` → a **new** `TokenResponse` (new access token **and** new refresh token; the old refresh token is dead).
- `401` session expired or replaced, or the access token is malformed; `404` if the user no longer exists → in every failure case, clear the session and go to login.
- ⚠️ The **old access token is required** in the body. That's why both tokens are persisted (section 8.3).
- Only ever called by the refresh logic in `baseQueryWithReauth` (section 8.4) — never from components.

#### `POST /logout`

```json
{ "refreshToken": "string" }
```

- `204` always (unknown token is treated as already logged out). Clear local state even if the request fails.

### 6.4 Property endpoints — `/api/v1/Properties`

⚠️ **The whole controller currently requires a logged-in user with the `User` role.** Guests get `401`, admins get `403` — including on browse/search/details. The UI design has a guest browsing state, so this is backend request #1. Build browse/search/details as public routes anyway; until the backend opens them, a guest who hits them sees a "log in to browse" prompt.

#### `GET /` — search / browse (paginated)

Query parameters (all optional; **omit** empty ones instead of sending `=`):

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int | `1` | must be ≥ 1 |
| `pageSize` | int | `10` | 1–100 |
| `searchTerm` | string | — | matches the **title only**, case-insensitive, "contains" |
| `city` | string | — | **exact** match |
| `minPrice` | number | — | inclusive |
| `maxPrice` | number | — | inclusive |
| `propertyType` | enum | — | `Apartment` `House` `Land` `Office` `Storage` `Building` |
| `propertyStatus` | enum | — | **only** `ForSale` or `ForRent` here |
| `paymentType` | enum | — | `Cash` `Installments` `DownPaymentAndInstallments` `Negotiable` |
| `landClassification` | enum | — | `A` `B` `C` |
| `legalStatus` | enum | — | `Tabo` `Maliye` `Taswiye` |
| `sortColumn` | string | `createdAt` | `createdAt` · `price` · `city` · `landClassification` (anything else → `createdAt`) |
| `sortDirection` | string | `desc` | `asc` · `desc` |

- Only **approved and active** listings are returned.
- Responses are cached on the server for up to 10 minutes; creating a listing clears that cache.
- `200` →
  ```json
  {
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 3,
    "totalCount": 27,
    "items": [
      {
        "id": "guid",
        "title": "string",
        "price": 250000,
        "paymentType": "Cash",
        "propertyType": "Apartment",
        "propertyStatus": "ForSale",
        "area": 140,
        "city": "string",
        "region": "string (optional — may be missing)"
      }
    ]
  }
  ```
- `400` invalid `page`/`pageSize` · `401`/`403` see the warning above.
- ⚠️ Summaries have **no image, no coordinates, no created date**. Cards use a placeholder image; a "map of results" view isn't possible yet (backend request #7).

#### `GET /{propertyId}` — property details

- `200` →
  ```json
  {
    "id": "guid",
    "title": "string",
    "description": "string (optional)",
    "price": 250000,
    "paymentType": "Installments",
    "propertyType": "House",
    "propertyStatus": "ForSale",
    "area": 220,
    "city": "string",
    "region": "string (optional)",
    "fullAddress": "string",
    "latitude": 31.9038,
    "longitude": 35.2034,
    "landClassification": "A",
    "legalStatus": "Tabo",
    "user": {
      "id": "guid",
      "fullName": "string",
      "phoneNumber": "string (optional)",
      "profileImageUrl": "string (optional)"
    }
  }
  ```
- `user` is the **seller**. The ownership document URL is intentionally **not** exposed.
- `404` if the listing doesn't exist **or** isn't approved and active (the API doesn't tell which). Show one "العقار غير متاح" screen.
- Server-cached up to 10 minutes.

#### `GET /mine` — the current user's own listings

- Returns **every** listing the logged-in user owns, in every moderation state, newest first. **Not paginated** (a plain array). Not cached.
- `200` →
  ```json
  [
    {
      "id": "guid",
      "title": "string",
      "price": 250000,
      "paymentType": "Cash",
      "propertyType": "Land",
      "propertyStatus": "ForSale",
      "area": 1000,
      "city": "string",
      "region": "string (optional)",
      "moderationStatus": "Pending",
      "rejectionReason": "string (only when Rejected)",
      "isActive": true,
      "createdAtUtc": "2026-09-24T18:00:00+00:00"
    }
  ]
  ```
- Show a status badge per `moderationStatus`; for `Rejected` show `rejectionReason`; for `isActive: false` show "موقوف".
- A `Pending` or `Rejected` listing is **not** reachable through `GET /{id}` (it returns 404) — the owner sees it only through this list until an owner-scoped details endpoint exists (backend request #8).

#### `POST /` — create a listing

```json
{
  "title": "string (required, ≤200)",
  "description": "string | null (≤2000)",
  "price": 250000,
  "paymentType": "Cash",
  "propertyType": "Apartment",
  "propertyStatus": "ForSale",
  "area": 140,
  "city": "string (required, ≤100)",
  "region": "string | null (≤100)",
  "fullAddress": "string (required, ≤500)",
  "latitude": 31.9038,
  "longitude": 35.2034,
  "landClassification": "A",
  "legalStatus": "Tabo",
  "ownershipDocumentUrl": "string (required, ≤500)"
}
```

- Rules: `price > 0`, `area > 0`, `propertyStatus` **must be `ForSale` or `ForRent`**, latitude −90…90, longitude −180…180, all enums must be valid names.
- `201 Created` → the created listing in the details shape (without `user`), plus a `Location` header. It starts **Pending** and **won't** appear in search until an admin approves it → after success, redirect to `/my-properties` with a "sent for review" toast. Don't navigate to `/properties/{id}` (it would 404).
- `400` validation · `401` not logged in.
- ⚠️ **No file upload exists yet** (Cloudinary integration is pending on the backend). `ownershipDocumentUrl` is a plain URL string for now, and there are **no property images** at all. Also: approval will require at least 3 images, so no listing can become public until image upload ships. Build the form with a clearly marked temporary URL field and an images section in "قريباً" state.

### 6.5 Not built yet on the backend

Nothing below exists — don't call it. Build nothing that depends on it without a `BACKEND_REQUESTS.md` entry.

- Current user profile ("me"), edit profile, change password while logged in, delete account
- Google sign-in
- Edit listing, edit description, deactivate/reactivate, mark sold/rented, delete listing
- Property images and document upload
- Admin: pending listings, approve, reject
- Favorites, conversations/messages (planned real-time via SignalR), reviews, reports, notifications
- AI price estimation

---

## 7. Project structure

```
src/
  main.jsx                     # ReactDOM root → <AppProviders><RouterProvider/></AppProviders>
  app/
    store.js                   # configureStore: api reducer + auth + ui
    router.jsx                 # createBrowserRouter — every route in one place
    providers.jsx              # Redux Provider, theme sync, toaster
  config/
    env.js                     # the only file that reads import.meta.env
  api/
    baseApi.js                 # createApi with baseQueryWithReauth; endpoints injected per feature
    baseQuery.js               # fetchBaseQuery + auth header + refresh mutex (section 8.4)
    types.js                   # JSDoc typedefs mirroring section 6 shapes
  features/
    auth/
      authSlice.js             # session state (section 8)
      authApi.js               # injectEndpoints: login, register, confirmEmail, resend, sendResetCode, changePassword, logout
      schemas.js               # zod schemas mirroring backend rules
      pages/                   # LoginPage, RegisterPage, CheckEmailPage, ConfirmEmailPage, ForgotPasswordPage, ResetPasswordPage
      components/
    properties/
      propertiesApi.js         # getProperties, getPropertyById, getMyProperties, createProperty
      constants.js             # enum lists + Arabic labels (section 3), sort options
      schemas.js
      hooks/useSearchFilters.js  # URL ⇄ filters (section 11)
      pages/                   # HomePage, SearchPage, PropertyDetailsPage, CreatePropertyPage, MyPropertiesPage
      components/              # PropertyCard, PropertyFilters, PropertyGallery, SellerCard, ModerationBadge, ...
    dashboard/pages/DashboardPage.jsx
    admin/pages/               # placeholders until backend exists
    ui/uiSlice.js              # theme (+ future UI-only state)
  components/
    ui/                        # Button, Input, Select, Textarea, Checkbox, Modal, ConfirmDialog, Badge, VerifiedBadge,
                               # Spinner, Skeleton, EmptyState, ErrorState, Pagination, Toast
    layout/                    # AppLayout, Header, Footer, MobileNav, AuthLayout
    form/                      # FormField wrappers binding RHF + label + error text
  routes/
    RequireAuth.jsx
    RequireGuest.jsx
    RequireRole.jsx
  lib/
    format.js                  # formatPrice, formatArea, formatDate (Latin digits)
    storage.js                 # safe localStorage get/set/remove (try/catch)
    http/problemDetails.js     # section 6.2 helper
    maps/                      # section 10
  locales/ar.js
  styles/index.css
  assets/
```

### 7.1 Rules for placing code

- Feature code stays inside its feature folder. Only truly shared pieces go in `components/` or `lib/`.
- Pages compose; components render. Data fetching happens in pages (or small feature hooks), not deep inside presentational components.
- One component per file, `PascalCase.jsx`. Hooks `useSomething.js`. Everything else `camelCase.js`.
- Named exports everywhere except route-level pages, which default-export so the router can lazy-load them (`lazy: () => import(...)`).

### 7.2 JSDoc types

Mirror every response shape from section 6 in `src/api/types.js`:

```js
/**
 * @typedef {'Apartment'|'House'|'Land'|'Office'|'Storage'|'Building'} PropertyType
 * @typedef {'ForSale'|'ForRent'|'Sold'|'Rented'} PropertyStatus
 * @typedef {'Pending'|'Approved'|'Rejected'} ModerationStatus
 *
 * @typedef {Object} PropertySummary
 * @property {string} id
 * @property {string} title
 * @property {number} price
 * ...
 *
 * @template T
 * @typedef {Object} PaginatedList
 * @property {number} pageNumber
 * @property {number} pageSize
 * @property {number} totalPages
 * @property {number} totalCount
 * @property {T[]} [items]
 */
```

Annotate endpoint results and component props with these types (`/** @param {{ property: PropertySummary }} props */`). When the contract changes, this file changes in the same commit.

---

## 8. Authentication

### 8.1 Session state (`authSlice`)

```js
{
  accessToken: null,     // string | null
  refreshToken: null,    // string | null
  expiresOnUtc: null,    // ISO string | null
  user: null,            // { id, email, roles: string[] } decoded from the JWT
  status: 'anonymous',   // 'anonymous' | 'authenticated'
}
```

Actions: `sessionStarted(tokenResponse)`, `sessionRefreshed(tokenResponse)`, `sessionEnded(reason)`.
Selectors: `selectIsAuthenticated`, `selectCurrentUser`, `selectIsAdmin`.

### 8.2 Reading the JWT

Decode with `jwt-decode` (decoding only — never trust it for security; the server validates). Claims present:

- `sub` → user id (GUID)
- `email`
- role: the key may be `role` **or** `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`, and the value may be a **string or an array**. Normalize to `roles: string[]` in one function.

There is **no name, phone, or avatar** in the token, and no "me" endpoint yet (backend request #4). The header shows the email until then.

### 8.3 Persistence

- The backend returns both tokens in the JSON body and needs **both** to refresh, so persist `{ accessToken, refreshToken, expiresOnUtc }` in `localStorage` under `judhur.auth` via `lib/storage.js`.
- Hydrate the slice from storage **before** the first render (read it in `store.js` as preloaded state).
- Consequence: an XSS bug could steal the session. So: **never** use `dangerouslySetInnerHTML`, never render user-supplied HTML, and never put tokens in URLs or logs. (A later backend change to an HttpOnly cookie would remove this risk — noted, not requested now.)

### 8.4 Refresh flow — `baseQueryWithReauth`

```
request ──► 401? ── no ──► return result
               │
              yes (and request is not /refresh-token, /login, /logout)
               │
      acquire mutex ──► another request already refreshed? ── yes ──► retry original with new token
               │ no
      POST /refresh-token { refreshToken, expiredAccessToken }
               │
        200 ──► sessionRefreshed ──► persist ──► release ──► retry original once
        other ─► sessionEnded('expired') ──► release ──► return the 401
```

Must-haves:

- **Use a mutex (`async-mutex`).** The backend keeps exactly one refresh token per user and deletes it when it issues a new one. Two parallel refreshes would make the second one fail and log the user out.
- Retry the original request **once**. Never loop.
- If the refresh fails (usually `401`), the session was ended elsewhere (for example a login on another device). End the session and show "انتهت جلستك، الرجاء تسجيل الدخول مجدداً".
- Optional nicety: refresh proactively when `expiresOnUtc` is less than a minute away. The 401 path must still work on its own — the server allows **zero clock skew**.
- `sessionEnded` must also call `api.util.resetApiState()` so no cached data from the previous user survives.

### 8.5 Logout

Call `POST /logout` with the refresh token, then **always** end the session locally (even if the call fails) and navigate to `/`.

### 8.6 Route guards

- `RequireAuth` → redirect to `/login?redirect=<current path>`; after login, return there.
- `RequireGuest` → logged-in users skip `/login` and `/register`.
- `RequireRole role="Admin"` → admin area. Also hide seller actions ("أضف عقاراً") from admins — admins never post listings.

---

## 9. Forms (React Hook Form + zod)

- Every form: `useForm({ resolver: zodResolver(schema), mode: 'onTouched' })`.
- Schemas **mirror the backend rules in section 6 exactly** (lengths, regexes, required fields), with Arabic messages. The client check is for UX; the server stays the authority.
- On submit error, run the error through `problemDetails.js`: `fieldErrors` → `setError(field, { message })`; anything else → a form-level alert above the submit button.
- Disable the submit button and show a spinner while submitting. Never allow double submit.
- Enum fields are `<select>` elements fed from `constants.js`: Arabic label shown, API value submitted.
- Numbers (`price`, `area`) with `valueAsNumber` or a zod `coerce`; send numbers, not strings.
- Optional text fields: send `null` (not `""`) when empty.
- Password fields: show/hide toggle and a live checklist of the four rules.

---

## 10. Maps — HERE

### 10.1 Setup

```bash
npm config set @here:registry https://repo.platform.here.com/artifactory/api/npm/maps-api-for-javascript/
npm install @here/maps-api-for-javascript
```

Commit an `.npmrc` with that registry line so fresh clones install correctly. Import with `import H from '@here/maps-api-for-javascript';`.

The API key is visible in the browser by nature. Restrict it to the app's domains in the HERE platform settings where possible, and keep it only in `VITE_HERE_API_KEY`.

### 10.2 Code layout (`src/lib/maps/`)

- `platform.js` — creates **one** `H.service.Platform({ apikey })` lazily and reuses it.
- `HereMap.jsx` — generic map component: `useRef` container + `useEffect` that creates `H.Map` with `platform.createDefaultLayers().vector.normal.map`, adds `new H.mapevents.Behavior(new H.mapevents.MapEvents(map))` and `H.ui.UI.createDefault(map, layers)`, listens to window resize → `map.getViewPort().resize()`, and **disposes on unmount** (`map.dispose()`). Props: `center`, `zoom`, `markers`, `onClick`, `className`.
- `LocationPicker.jsx` — used in the create-listing form: click (or drag the marker) to set a point. Convert the tap with `map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY)`. Reports `{ latitude, longitude }` to React Hook Form through a `Controller`.
- `geocoding.js` — thin wrappers over HERE Geocoding & Search (REST, same API key):
  - reverse geocode after picking a point → suggest `fullAddress` / `city` (the user can edit; never overwrite something they typed)
  - address search box → move the map to the result
  - request Arabic results (`lang=ar`) and restrict to the area around Palestine.
- Lazy-load map components (`React.lazy`) so pages without a map don't download the library.

### 10.3 Behaviour

- Default view: centered on Palestine, roughly `{ lat: 31.9, lng: 35.2 }`, zoom ≈ 8.
- Details page: a single marker at the listing's `latitude`/`longitude`, no dragging.
- Keep the map inside a fixed-height container with rounded corners; on mobile it collapses behind a "عرض على الخريطة" button.
- If the key is missing or the library fails to load, show a static fallback card with the address text — the page must still work.

---

## 11. Pages and routes

| Path | Access | Page | API |
|---|---|---|---|
| `/` | public | Home: hero with search box, quick filters, latest listings | `GET /Properties?pageSize=8` |
| `/properties` | public* | Search with filters sidebar (drawer on mobile), sort, pagination | `GET /Properties` |
| `/properties/:id` | public* | Details: gallery placeholder, key facts, description, map, seller card with call/WhatsApp link | `GET /Properties/{id}` |
| `/login` | guest | Login | `POST /login` |
| `/register` | guest | Sign-up | `POST /register` |
| `/register/check-email` | guest | "Check your email" + resend | `POST /resend-confirmation` |
| `/confirm-email` | public | Confirms from the email link | `POST /confirm-email` |
| `/forgot-password` | guest | Ask for a reset code | `POST /send-reset-password-code` |
| `/reset-password` | guest | Code + new password | `POST /change-password` |
| `/dashboard` | user | Buyer-first dashboard; "My listings" block only if they have any | `GET /Properties/mine`, `GET /Properties` |
| `/my-properties` | user | Own listings with moderation badges and rejection reasons | `GET /Properties/mine` |
| `/properties/new` | user (not admin) | Create listing (multi-step form + location picker) | `POST /Properties` |
| `/admin` | admin | Placeholder — backend not ready | — |
| `*` | public | 404 | — |

\* Currently blocked by the backend for guests and admins — see section 6.4.

### Search state lives in the URL

Filters, sort, and page are stored in the query string (`useSearchParams`), not in Redux, so results are shareable and survive refresh. `useSearchFilters` parses the URL into the API params (dropping empty values) and writes changes back. Changing any filter resets `page` to 1. Debounce the text search (~400 ms).

### Every data-driven screen has four states

Loading (skeletons, not spinners, for lists and cards) · empty (friendly Arabic message plus a next action) · error (message + retry, with `requestId` for 500s) · success.

---

## 12. Redux / RTK Query rules

- **Server data only through RTK Query.** Never copy API data into a slice.
- Slices: `auth` and `ui`. Add another only for real client-only state, and say why.
- Tag types: `Property`, `MyProperties`.
  - `getProperties` → provides `Property` (`LIST`)
  - `getPropertyById` → provides `{ type: 'Property', id }`
  - `getMyProperties` → provides `MyProperties`
  - `createProperty` → invalidates `MyProperties` (it's pending, so the public list won't change yet)
- Keep query args plain and serializable (an object of primitives) so caching works.
- Use generated hooks (`useGetPropertiesQuery`, …) in pages. `skip` when a required arg is missing.
- Don't set a long `keepUnusedDataFor` — the server already caches public lists for 10 minutes.

---

## 13. `BACKEND_REQUESTS.md`

The contract gap list between this repo and the backend. Create it at the repo root, seeded with the items below. Format per entry:

```md
## <number>. <short title>
- Status: open | done
- Why the frontend needs it:
- Endpoint / change wanted: (method, path, request/response shape)
- Current workaround in the UI:
```

When Abdulrahman confirms something is done: mark it `done`, update section 6 of this file, then remove the workaround.

### Seed entries (already known)

1. **Allow guests to browse.** `GET /api/v1/Properties` and `GET /api/v1/Properties/{id}` should allow anonymous access; the design has a guest state. Decide separately whether admins may view listings (they must not *post* them).
2. **Point the confirmation email to the frontend.** Set `Frontend:ConfirmEmailUrl` to `http://localhost:5173/confirm-email` in development. It currently points at the backend's own `POST` endpoint, so clicking the email link does a `GET` and fails.
3. **Add an error code to non-validation ProblemDetails** (for example an extension `"code": "Identity.EmailNotConfirmed"`). Without it the UI can't tell "email not confirmed" from "account locked" (both `403`), or show its own Arabic message per error.
4. **`GET` current user** (for example `/api/Identity/Account/me`): id, fullName, email, phoneNumber, city, bio, profileImageUrl, roles. Needed for the header, dashboard, and profile page.
5. **Arabic messages for account endpoints.** Validator messages and identity service errors are English today, unlike the property endpoints.
6. **Register ignores `bio` and `profileImageUrl`.** They're accepted in the request but never saved.
7. **Richer search results.** Add `mainImageUrl` and `createdAtUtc` to the search summary; add `latitude`/`longitude` too if a map view of results is wanted.
8. **Owner details endpoint.** A way for the owner to open their own Pending/Rejected listing (the public details endpoint returns 404 for those).
9. **Currency.** `price` has no currency; decide one fixed currency or add a field.
10. **CORS for deployment.** Development uses the Vite proxy; a deployed frontend on another origin needs a CORS policy allowing its origin, the `Authorization` header, and `Content-Type`.
11. **Image and document upload** (Cloudinary) — blocks real listing creation and approval (min 3 images).
12. **Everything in section 6.5**, requested one feature at a time as the UI reaches it.

---

## 14. Build order

Build in this order; each step ends in a working app, and each is its own branch + PR.

1. **Scaffold** — Vite + React (JS), Tailwind v4, Cairo, RTL, ESLint/Prettier, folder structure, env config, Vite proxy, `.npmrc`, `BACKEND_REQUESTS.md`.
2. **Design system** — tokens (light/dark), theme toggle, `components/ui` primitives, `ConfirmDialog`, `VerifiedBadge`, layout (header, footer, mobile nav), 404 page.
3. **API + auth core** — `baseApi`, `baseQueryWithReauth` with the mutex, `authSlice` + persistence, `problemDetails.js`, route guards.
4. **Auth screens** — register → check email → confirm email → login → forgot/reset password → logout.
5. **Browse** — home, search with URL-synced filters, pagination, `PropertyCard`, skeleton/empty/error states.
6. **Details** — details page, seller card, HERE map with a single marker.
7. **Create listing** — multi-step form, `LocationPicker` + reverse geocoding, temporary document URL field, images in "قريباً" state.
8. **My listings + dashboard** — moderation badges, rejection reasons, buyer-first dashboard.
9. **Admin area and the rest** — as backend endpoints land (section 13).

---

## 15. Code conventions

- Function components and hooks only. No class components.
- Keep components small; move logic into hooks when a component exceeds roughly 150 lines.
- Tailwind classes directly in JSX; `clsx` for conditional classes. No inline `style` except for truly dynamic values.
- Accessibility: every input has a `<label>`; icon-only buttons have `aria-label` in Arabic; dialogs trap focus and close on Escape; visible focus rings; color is never the only signal.
- Images: `loading="lazy"`, fixed aspect ratio containers, an Arabic `alt`.
- No `console.log` left in committed code.
- Never log, persist, or display tokens beyond what section 8 describes.

### Git

- One branch + PR per build-order step or feature.
- Commit messages: **one short line**, conventional style, English — for example `feat(auth): add login page`, `fix(search): reset page when filters change`.

---

## 16. Code style

Goal: code that is simple, readable, and easy to explain line by line in a graduation-project defense. Prefer the obvious solution over the clever one.

1. **Keep it direct.**
   - Plain function components with `useState` / `useEffect` / Redux hooks.
   - Straightforward `if`/`else` and early returns. No nested ternaries, no clever one-liners, no chained `reduce`/`flatMap` tricks when a simple loop or `map` is clearer.
   - No higher-order components, render props, factories, or generic "engine" code.
   - No custom hook unless the same logic is used in 2+ places.
   - No `useMemo` / `useCallback` / `React.memo` unless there is a real, visible performance problem.
2. **Keep it small and flat.**
   - Short files, short functions. One component per file.
   - Don't split a component into many tiny pieces just for structure; split only when a piece is reused or the file becomes hard to read.
   - Don't create shared helpers "for later". Duplicate a few lines instead of building an abstraction nobody else uses yet.
3. **Clear names over comments.** Descriptive variable and function names. Comments only where the "why" isn't obvious — one short line, in plain English.
4. **Libraries:** only the ones listed in this file, each used in its most standard, documented way (the pattern shown in its official getting-started docs).
5. **Do not simplify away correctness.** Keep the token refresh lock, error handling for every API call, form validation, loading/empty/error states, and the DESIGN.md match. Simple does not mean fragile.

After every task, explain each created or changed file in short, simple Palestinian Arabic: what the file does and why it is written this way (code names on their own lines, not inside Arabic sentences).

## 17. Before you finish any task

- [ ] Every API call matches section 6 exactly (path, method, body keys, enum strings).
- [ ] Loading, empty, error, and success states exist and are in Arabic.
- [ ] Works in RTL and in both light and dark mode, on mobile width and desktop.
- [ ] Form validation mirrors the backend rules; server errors land on the right fields.
- [ ] Destructive actions go through `ConfirmDialog`.
- [ ] No invented endpoints — anything missing is in `BACKEND_REQUESTS.md` and mentioned in your reply.
- [ ] The code follows section 16 (code style) and every screen matches Figma per DESIGN.md.
- [ ] `npm run lint` and `npm run build` pass.
