# Judhur (جذور) — Frontend

> Project context for Claude Code working in the **frontend repository**. Read this whole file before writing code.
> The backend lives in a **separate repository** that you cannot see. Section 6 (API contract) is your only source of truth for the backend — never guess an endpoint, a field name, or a status code.
>
> Contract snapshot taken from the backend source on 2026-09-30 (backend `main` + the `feature/Favorite` branch); notifications added 2026-10-01.
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
- **Currency is not in the API yet** (`BACKEND_REQUESTS.md` #9). Use a single constant `DEFAULT_CURRENCY = 'ILS'` in `src/lib/format.js` and format through one function, so it's a one-line change later.
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
- Google sign-in sits next to email sign-in and sign-up (`POST /google`, section 6.3; the Figma button sends the user to Google's sign-in page, section 8.6).

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

### Vite dev proxy (the default in development)

The backend allows CORS only from `http://localhost:5173` (a deployed origin is backend request #10). The Vite proxy stays the default: proxy `/api` through Vite so the browser only ever talks to its own origin:

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
VITE_GOOGLE_CLIENT_ID=      # Google OAuth Web client ID (public); empty → the Google button is hidden
```

Real values go in `.env.local` (git-ignored). Read them only in `src/config/env.js` and import from there.

Exception: the Google OAuth Web client ID is public (it ships in the page anyway), so it is committed in `.env.development` and `.env.production` and works without any local setup. `.env.local` still overrides it.

### Dev accounts

The backend seeds an admin and a normal user on startup. Get the credentials from Abdulrahman (they're in the backend's database initializer) — never commit them to this repo. Newly registered users must confirm their email before they can log in.

---

## 6. API contract

### 6.1 Global conventions

#### Base paths

| Group | Path | Versioned |
|---|---|---|
| Account / auth | `/api/Identity/Account/...` | no |
| Public + seller properties | `/api/v1/User/Properties/...` | yes (always `v1` for now) |
| Favorites | `/api/v1/User/Favorites/...` | yes |
| Notifications | `/api/v1/User/Notifications/...` | yes |
| Admin moderation | `/api/v1/Admin/Properties/...` | yes |

- The path constants live in `src/api/baseQuery.js`. Paths are case-insensitive on the server; use exactly the casing shown here.
- **JSON**: camelCase property names. **Enums are strings** (`"ForSale"`, not `1`). **Null properties are omitted** from responses — treat a missing key as `null`.
- **IDs** are GUID strings. **Dates** are ISO-8601 with offset (`DateTimeOffset`). **Money and area** are JSON numbers (decimals).
- **Auth header**: `Authorization: Bearer <accessToken>`.
- **Roles** in the JWT: `User` or `Admin` (section 8.2).

#### Who can call what

| Endpoint group | Guest | User | Admin |
|---|---|---|---|
| `GET /User/Properties` and `GET /User/Properties/{id}` | ✅ | ✅ | ✅ |
| Every other `/User/Properties/*` (seller actions) | `401` | ✅ | `403` |
| `/User/Favorites/*` | `401` | ✅ | `403` |
| `/User/Notifications/*` | `401` | ✅ | ✅ |
| `/Admin/Properties/*` | `401` | `403` | ✅ |

Admins never create, own, or favorite listings. Hide those actions for admins in the UI.

#### Server-side cache

`GET /User/Properties` and `GET /User/Properties/{id}` are cached on the server for up to 10 minutes. Every change that affects what the public sees (approve, edit details, images, deactivate, delete, …) clears that cache immediately — never wait for it or work around it.

#### Enums

| Enum | Values | Notes |
|---|---|---|
| `PropertyType` | `Apartment` `House` `Land` `Office` `Storage` `Building` | |
| `PropertyStatus` | `ForSale` `ForRent` `Sold` `Rented` | responses may contain all four; **create** and the **search filter** accept only `ForSale` / `ForRent` |
| `PaymentType` | `Cash` `Installments` `DownPaymentAndInstallments` `Negotiable` | |
| `LandClassification` | `A` `B` `C` | |
| `LegalStatus` | `Tabo` `Maliye` `Taswiye` | |
| `ModerationStatus` | `Pending` `Approved` `Rejected` | |

The Arabic labels are in section 3.

### 6.2 Error format (ProblemDetails)

Every error is `application/problem+json`. **All messages are Arabic**, account endpoints included. **Every** ProblemDetails — `400` and framework-generated ones too — carries an Arabic `title`, `instance` (`"<METHOD> <path>"`) and `requestId`.

**Validation / business-rule error — `400`:**

```json
{
  "title": "البيانات المدخلة غير صالحة.",
  "status": 400,
  "instance": "POST /api/v1/User/Properties",
  "requestId": "0HN...",
  "errors": {
    "Price": ["السعر يجب أن يكون أكبر من صفر."],
    "PropertyErrors.MinImagesRequired": ["يجب رفع 3 صور على الأقل"]
  }
}
```

Keys under `errors` are one of two kinds:

- **A request field in PascalCase** (`Price`, `Title`, `PhoneNumber`, `RejectionReason`) — from request validation. Map it to a form field by lower-casing the first letter (`PhoneNumber` → `phoneNumber`). A field key that matches no form field becomes a form-level message.
- **An error code** — always `Group.Name` with a dot (`PropertyErrors.MinImagesRequired`, `PropertyErrors.CannotRemoveMainImage`, `Pagination.PageInvalid`, `Identity.InvalidResetCode`, `Identity.PasswordTooShort`) — from business rules. Show it as a form-level or toast message. The codes are stable, so the UI **may** branch on them or map one to a form field.

**Any other error — `401` / `403` / `404` / `409` / `500`:**

```json
{
  "title": "العقار غير موجود",
  "status": 404,
  "instance": "GET /api/v1/User/Properties/…",
  "requestId": "0HN..."
}
```

- The **human-readable message is in `title`**, not `detail`.
- There is **no error code** on these responses (backend request #3 stays open). Branch on `status` only.
- **Special `409`** — a database uniqueness conflict (for example two requests at the same moment):
  ```json
  {
    "title": "تعارض في البيانات",
    "status": 409,
    "detail": "هذا الإجراء يتعارض مع بيانات موجودة، ربما قام أحد بتنفيذ الإجراء نفسه مسبقًا."
  }
  ```
  Show `title` and `detail`, then refetch.
- Unhandled server errors: `500` with a generic `title` and a `detail`. Show a generic Arabic "حدث خطأ غير متوقع" plus the `requestId` (small, selectable text) so it can be reported. Every body carries it (backend request #15 is done); still treat it as optional, because a `429` or a middleware `401`/`403` may have no body at all.
- `429 Too Many Requests` from rate-limited endpoints may have an empty body — always handle it by status.
- `401`/`403` produced by the auth middleware itself (missing/expired token, wrong role) may have an empty body or a bare ProblemDetails without a meaningful `title`.

One helper, `src/lib/http/problemDetails.js`, turns any RTK Query error into `{ status, message, fieldErrors, errorCodes, requestId }` (field keys camelCased, error-code keys kept as sent). Use it everywhere; forms go through `components/form/applyServerErrors.js`.

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
- ⚠️ `userName` is still required, but the design has no user-name field — the email is sent as `userName` (backend request #13).

#### `POST /login`

```json
{ "email": "string", "password": "string" }
```

- `200` → `TokenResponse`:
  ```json
  { "accessToken": "jwt", "refreshToken": "base64 string", "expiresOnUtc": "2026-09-25T12:30:00+00:00" }
  ```
- `401` wrong email or password.
- `403` **either** email not confirmed **or** account locked (5 failed attempts → locked for 5 minutes). Both are `403` with an Arabic `title` and no error code (backend request #3). On `403` show the server message plus a "resend confirmation email" link.
- `400` validation.
- **Single session per user:** logging in issues a new refresh token and deletes every older one. Logging in on another device ends the session here on its next refresh (section 8.4).

#### `POST /google` — sign in with Google

```json
{ "idToken": "string (the credential from Google's button)", "phoneNumber": "string? (same regex as register)", "city": "string? (≤100)" }
```

- `200` → the same `TokenResponse` as `/login`: start the session exactly like a normal login (same `sessionStarted`, same persistence, same redirect).
- `400` with the error key `Identity.GoogleRegistrationIncomplete` → a first-time Google user. Show a small step with phone and city (the register rules and messages), then send the **same** `idToken` again with `phoneNumber` and `city`. The token is valid for about an hour: keep it in component state only, never in storage.
- `400` for an invalid phone or city → on the form fields as usual.
- `401` → «تعذّر التحقق من حساب Google» · `403` → the server `title` (unverified Google email or locked account) · `429` → the usual rate-limit message.
- An existing account with the same email is linked automatically.
- Never decode the `idToken` to read the email; send it as received.

#### `POST /confirm-email`

```json
{ "userId": "guid", "token": "string" }
```

- `204` confirmed · `400` link invalid or expired.
- The email contains a link to the frontend page **`/confirm-email`** (`http://localhost:5173/confirm-email` in development) with `?userId=<guid>&token=<url-encoded token>`. The page reads both query params, `POST`s them here, and shows success (→ login) or failure (→ "resend" form).
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

- **Always `204`**. If the account exists, a **6-digit code** is emailed, valid for **5 minutes** (the design says "link" — backend request #14).
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

### 6.4 Shared response shapes

```ts
// PaginatedList<T>
{ pageNumber: number, pageSize: number, totalPages: number, totalCount: number, items: T[] }

// PropertyImage
{ id: string, url: string, displayOrder: number, isMainImage: boolean }

// UserInfo (the seller)
{ id: string, fullName: string, phoneNumber?: string, profileImageUrl?: string }

// PropertySummary — search results AND favorites list (same card)
{
  id: string, title: string, price: number,
  paymentType: PaymentType, propertyType: PropertyType, propertyStatus: PropertyStatus,
  area: number, city: string, region?: string,
  mainImageUrl?: string          // missing if the listing has no main image
}
```

- `images` arrays are always sorted by `displayOrder`. Exactly one image has `isMainImage: true` when the list is not empty.
- Pagination query params everywhere: `page` (default `1`, ≥ 1) and `pageSize` (default `10`, 1–100). Invalid values → `400` with `Pagination.PageInvalid` / `Pagination.PageSizeInvalid`.

### 6.5 Public property endpoints — `/api/v1/User/Properties`

Open to guests, users, and admins.

#### `GET /` — search / browse (paginated)

Query parameters (all optional; **omit** empty ones instead of sending `=`):

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int | `1` | must be ≥ 1 |
| `pageSize` | int | `10` | 1–100 |
| `searchTerm` | string | — | matches the **title only**, case-insensitive, "contains" |
| `city` | string, repeatable | — | **exact** match; several values allowed, **at most 20** (more → `400` `PropertyErrors.TooManyCitiesInFilter`) |
| `minPrice` | number | — | inclusive |
| `maxPrice` | number | — | inclusive |
| `propertyType` | enum, repeatable | — | `Apartment` `House` `Land` `Office` `Storage` `Building` |
| `propertyStatus` | enum, repeatable | — | **only** `ForSale` or `ForRent` here; the UI sends one value (a single choice) |
| `paymentType` | enum, repeatable | — | `Cash` `Installments` `DownPaymentAndInstallments` `Negotiable` |
| `landClassification` | enum, repeatable | — | `A` `B` `C` |
| `legalStatus` | enum, repeatable | — | `Tabo` `Maliye` `Taswiye` |
| `sortColumn` | string | `createdAt` | `createdAt` · `price` · `city` · `landClassification` (anything else → `createdAt`) |
| `sortDirection` | string | `desc` | `asc` · `desc` |

- `200` → `PaginatedList<PropertySummary>`.
- Returns approved **and** active listings only. Without a `propertyStatus` filter this **includes `Sold` and `Rented`** — show a "تم البيع" / "تم التأجير" ribbon on those cards.
- **Several values:** a repeatable param is sent once per value (`?city=نابلس&city=جنين&paymentType=Cash`), never comma-joined. Values of one filter are **OR**, different filters are **AND**. A single value still works.
- `400` invalid `page`/`pageSize`, an invalid enum value, or more than 20 cities (`PropertyErrors.TooManyCitiesInFilter` — show its message).
- ⚠️ Still no `createdAtUtc` or coordinates on summaries, so no "map of results" view yet (backend request #7).

#### `GET /{propertyId}` — details

```ts
{
  id, title, description?, price, paymentType, propertyType, propertyStatus,
  area, city, region?, fullAddress, latitude, longitude,
  landClassification, legalStatus,
  user: UserInfo,                // the seller
  images: PropertyImage[]
}
```

- **Phone rule:** `user.phoneNumber` is returned **only when the request carries a valid token**. For guests the key is missing. Show "سجّل الدخول لإظهار رقم الهاتف" with a login link instead of the call/WhatsApp buttons. The server caches the guest and signed-in versions separately.
- ⚠️ RTK Query caches by argument, not by token, so the session start and end reset the whole API cache (section 8.4) — a details page cached as a guest is refetched with the phone, and vice versa.
- The ownership document is **never** exposed here.
- `404` if the listing does not exist, is not approved, or is inactive (the API doesn't tell which) → one "العقار غير متاح" screen.

### 6.6 Seller endpoints — `/api/v1/User/Properties` (role `User`)

All return `401` without a token and `403` for admins. **`404` also means "belongs to another user"** — never assume a listing exists.

#### `GET /mine` — own listings

Plain array (**not paginated**), newest first, every moderation state. Not cached.

```ts
{
  id, title, price, paymentType, propertyType, propertyStatus, area, city, region?,
  moderationStatus, rejectionReason?, isActive, createdAtUtc,
  mainImageUrl?
}[]
```

#### `GET /mine/{propertyId}` — owner details

```ts
{
  id, title, description?, price, paymentType, propertyType, propertyStatus,
  area, city, region?, fullAddress, latitude, longitude, landClassification, legalStatus,
  hasOwnershipDocument: boolean, // the document itself is never returned to the owner
  moderationStatus, rejectionReason?, reviewedAtUtc?,
  isActive, createdAtUtc,
  images: PropertyImage[]
}
```

Used for the owner's listing page and to pre-fill the edit form. Works in every moderation state. `404` if missing or not owned.

#### `POST /` — create

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
  "legalStatus": "Tabo"
}
```

- Rules: `price > 0`, `area > 0`, `propertyStatus` **must be `ForSale` or `ForRent`**, latitude −90…90, longitude −180…180, all enums must be valid names.
- There is **no** `ownershipDocumentUrl` — the document and the images are uploaded after creation (6.7).
- `201` → the details shape with `images: []` and **no** `user`, plus a `Location` header. The listing starts `Pending`.
- After `201`, continue to the media step (images + document) with the returned `id`. Don't navigate to `/properties/{id}` (it would 404 until approved).
- `400` validation · `401` not logged in.

#### `PUT /{propertyId}/details`

Same body as create **without** `description` and **without** `propertyStatus`.

- `204`. ⚠️ **Any successful call sends the listing back to `Pending`** — an approved listing disappears from search until an admin approves it again; a rejected listing goes back to the admin queue. On approved listings, confirm first: "تعديل التفاصيل سيعيد العقار للمراجعة ويخفيه من البحث مؤقتاً".
- `400` · `404`.

#### `PUT /{propertyId}/description`

```json
{ "description": "string | null (≤2000)" }
```

- `204`. Send `null` or `""` to clear. Does **not** change moderation.

### 6.7 Media — `/api/v1/User/Properties` (role `User`)

Both uploads are `multipart/form-data`. Build a `FormData` and **do not set `Content-Type` yourself** (the browser adds the boundary).

#### `POST /{propertyId}/images`

| Form field | Type | Notes |
|---|---|---|
| `file` | file | required — JPG, PNG or WEBP, max 5 MB |
| `isMainImage` | boolean | optional, default `false` |

- `200` → the created `PropertyImage`.
- The **first** image becomes main automatically. `isMainImage=true` on a later upload makes it the new main.
- Max **10** images → `400` with `PropertyErrors.MaxImagesReached`.
- ⚠️ **Upload images one at a time** (await each request before the next). Parallel uploads can collide on the image order and return the database `409` from 6.2.
- Validate type and size on the client before uploading.

#### `DELETE /{propertyId}/images/{imageId}`

- `204`.
- `400` `PropertyErrors.CannotRemoveMainImage` — set another image as main first. Disable the delete button on the main image.
- `400` `PropertyErrors.MinImagesRequired` — an **approved** listing must keep at least 3 images.
- `404` image or listing not found.

#### `PUT /{propertyId}/images/{imageId}/main`

- `204` · `404`.

#### `PUT /{propertyId}/ownership-document`

| Form field | Type | Notes |
|---|---|---|
| `file` | file | required — PDF, JPG, JPEG, PNG or WEBP, max 10 MB |

- `204`. Replaces any previous document.
- ⚠️ Replacing the document of an **approved or rejected** listing sends it back to `Pending` (confirm dialog on approved listings).
- The document is private. The owner only ever sees `hasOwnershipDocument`. Public pages may show the "موثّق" badge for approved listings.

### 6.8 Lifecycle actions — `/api/v1/User/Properties` (role `User`)

All are `POST` with **no body** and return `204`.

| Route | Allowed when | Otherwise |
|---|---|---|
| `/{id}/deactivate` | listing is active (any moderation state) | `409` already inactive |
| `/{id}/reactivate` | approved **and** inactive | `409` |
| `/{id}/resubmit` | `Rejected` | `409` |
| `/{id}/mark-sold` | approved **and** `ForSale` | `409` |
| `/{id}/mark-rented` | approved **and** `ForRent` | `409` |

- `mark-sold` / `mark-rented` are **irreversible** → confirm dialog.
- `resubmit` clears the rejection reason and puts the listing back in the admin queue. It exists because image changes do **not** reset moderation on their own.

#### `DELETE /{propertyId}`

- `204`. Soft delete — the listing disappears everywhere, including `/mine`. Confirm dialog required.

#### Readiness checklist (very important)

A `Pending` listing reaches the admin queue **only** when it has:

1. at least **3 images**,
2. a **main image**,
3. an **ownership document** (`hasOwnershipDocument: true`).

If any is missing, the listing is invisible to admins and waits forever. On every `Pending` or `Rejected` listing, show a checklist with these three items and what is missing. Approval re-checks them.

#### What the owner UI shows per state

| State | Badge | Show |
|---|---|---|
| `Pending` | قيد المراجعة | readiness checklist · edit details · edit description · media · document · deactivate · delete |
| `Approved`, active | منشور | edit details (confirm: back to review) · edit description · media · document (confirm) · deactivate · mark sold **or** mark rented (by `propertyStatus`) · delete |
| `Approved`, inactive | موقوف | reactivate · edit · media · delete |
| `Rejected` | مرفوض + `rejectionReason` | the reason in a clear alert · readiness checklist · edit details or replace document (both send it back automatically) · media · **"إعادة الإرسال للمراجعة"** (resubmit) · delete |
| `Sold` / `Rented` | تم البيع / تم التأجير | deactivate · delete (no way back to `ForSale` / `ForRent`) |

Rule of thumb: if the owner only fixed images after a rejection, the "إعادة الإرسال" button is how the listing goes back to review.

### 6.9 Favorites — `/api/v1/User/Favorites` (role `User`)

| Method | Route | Success | Errors |
|---|---|---|---|
| `POST` | `/{propertyId}` | `204` | `404` not public · `409` already a favorite |
| `DELETE` | `/{propertyId}` | `204` | `404` not in favorites |
| `GET` | `/?page=&pageSize=` | `200` `PaginatedList<PropertySummary>`, most recently added first | `400` |
| `GET` | `/ids` | `200` `string[]` (property ids) | — |

- Only approved and active listings can be added. Removing always works, even if the listing was hidden later.
- Favorites of listings that became hidden are **kept** but left out of both lists; they come back if the listing becomes public again.
- The list returns the **same shape as search**, so reuse `PropertyCard`.

**Heart icon on cards and details.** Search and details are cached for everyone, so they can't say whether a listing is a favorite. Instead:

1. When the user is signed in with the `User` role, call `GET /ids` once (RTK Query) and keep it cached.
2. Turn it into a `Set` with `selectFromResult` and check `favoriteIds.has(property.id)` per card — never search the array per card.
3. Toggle with optimistic updates on the `/ids` cache. Treat `409` on add and `404` on remove as success (the server already has the state you wanted), then refetch.
4. Guests see the heart as a login prompt. Admins see no heart.

In code: `useFavoriteIds()` (the Set, the count, `canFavorite`) and `FavoriteButton` (variants `card`, `gallery`, `details`). `addFavorite` / `removeFavorite` use a `queryFn` that turns `409` / `404` into success with `alreadyDone`, patch `getFavoriteIds` with `updateQueryData` (undone on failure), invalidate `Favorites`, and also `FavoriteIds` when `alreadyDone`. The card heart is a sibling of the card link, not inside it.

### 6.10 Admin moderation — `/api/v1/Admin/Properties` (role `Admin`)

#### `GET /pending?page=&pageSize=`

`200` → `PaginatedList<PendingProperty>`, **oldest first** (fair queue):

```ts
{ id, title, price, paymentType, propertyType, city, region?, mainImageUrl?, createdAtUtc }
```

Only `Pending` listings that pass the readiness checklist (6.8) appear here.

#### `GET /{propertyId}` — review page

```ts
{
  id, title, description?, price, paymentType, propertyType, propertyStatus,
  area, city, region?, fullAddress, latitude, longitude, landClassification, legalStatus,
  moderationStatus, rejectionReason?, reviewedAtUtc?, isActive, createdAtUtc,
  images: PropertyImage[],
  seller?: UserInfo,                     // missing if the seller account no longer exists
  ownershipDocumentUrl?: string,         // signed link, valid for 10 minutes
  ownershipDocumentExpiresAtUtc?: string
}
```

- Works for **any** moderation state. `404` if missing.
- Open the document in a new tab (`target="_blank" rel="noopener noreferrer"`). It can be a PDF or an image. After `ownershipDocumentExpiresAtUtc`, refetch the page to get a new link — **never** store or cache the link beyond that.
- The review page also previews it in the document card (`ReviewDocumentCard`): an `<img>` for `.jpg/.jpeg/.png/.webp`, an `<object type="application/pdf">` for `.pdf` when `navigator.pdfViewerEnabled` is not `false`; any other type, a failed image, or no PDF viewer shows a short note. The preview follows the refreshed link, and «افتح بحجم كامل» stays.

#### `POST /{propertyId}/approve`

- No body. `204` → back to the queue with a success toast.
- `400` with one of `PropertyErrors.MinImagesRequired`, `PropertyErrors.MainImageRequired`, `PropertyErrors.OwnershipDocumentRequired`.
- `409` already approved · `404`.

#### `POST /{propertyId}/reject`

```json
{ "rejectionReason": "string (required, ≤500)" }
```

- `204`. The owner sees the reason on their listing.
- `400` missing/too long · `409` the listing is approved (cannot be rejected) or already rejected · `404`.
- Use a dialog with a textarea, a live character counter (500), and quick-pick reasons that fill the textarea (e.g. "الصور غير واضحة", "وثيقة الملكية غير واضحة", "المعلومات غير مكتملة").

### 6.11 Notifications — `/api/v1/User/Notifications` (any signed-in role)

`User` and `Admin` both have notifications. Today the backend sends them to the seller when an admin approves or rejects a listing.

```ts
// Notification
{
  id: string,
  type: 'PropertyApproved' | 'PropertyRejected',   // more types will come later
  title: string, body: string,                     // Arabic, written by the server — show them as they are
  referenceId?: string,                            // the listing id for the two property types
  isRead: boolean,
  createdAtUtc: string
}
```

| Method | Route | Success | Errors |
|---|---|---|---|
| `GET` | `/?page=&pageSize=` | `200` `PaginatedList<Notification>`, newest first | `400` |
| `GET` | `/unread-count` | `200` `{ count: number }` | — |
| `POST` | `/{notificationId}/read` | `204` (also when it was already read) | `404` missing or not yours |
| `POST` | `/read-all` | `204` | — |

- **Bell** in the navbar for every signed-in user (`NotificationsBell`): the unread badge (hidden at `0`) from `GET /unread-count`, polled every 60 s and refetched on window focus, skipped for guests (`useUnreadCount`). A click opens the latest 5 (`pageSize=5`, refetched on each open), «تعليم الكل كمقروء» and «عرض الكل» → `/notifications`.
- **Opening a notification** calls `POST /{id}/read` without checking `isRead`. `PropertyApproved` and `PropertyRejected` then go to `/my-properties/{referenceId}`; any other type is only marked as read.
- Unknown types get the generic bell icon — never hide or break on a new type.
- Marking read is optimistic: the cached pages and the unread count change at once, are undone on failure, and are refetched after.

### 6.12 Not built yet on the backend

Nothing below exists — don't call it. Build nothing that depends on it without a `BACKEND_REQUESTS.md` entry.

- Current user profile (`me`), edit profile, change password while logged in, delete account
- Conversations / messages (SignalR), reviews, reports
- AI price estimation
- Currency on prices (still `DEFAULT_CURRENCY`)
- Admin statistics, user management, and AI-usage screens (in Figma, no endpoints)

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
      authApi.js               # injectEndpoints: login, googleSignIn, register, confirmEmail, resend, sendResetCode, changePassword, logout
      schemas.js               # zod schemas mirroring backend rules
      pages/                   # LoginPage, RegisterPage, CheckEmailPage, ConfirmEmailPage, ForgotPasswordPage, ResetPasswordPage
      components/
    properties/
      propertiesApi.js         # public search/details + seller endpoints (6.5–6.8)
      constants.js             # enum lists + Arabic labels (section 3), sort options
      schemas.js
      searchFilters.js         # URL ⇄ filters, plain functions (section 11)
      listingState.js          # owner state (published/paused/pending/rejected/sold/rented) + readiness checklist
      pages/                   # HomePage, SearchPage, PropertyDetailsPage, CreatePropertyPage, MyPropertiesPage,
                               # MyPropertyPage, EditPropertyPage
      components/              # PropertyCard, PropertyFilters, PropertyGallery, SellerCard, ModerationBadge, ...
    favorites/
      favoritesApi.js          # favorites list, ids, add, remove (6.9) — optimistic on the ids cache
      useFavoriteIds.js        # the ids as a Set (createSelector + selectFromResult), skipped for guests/admins
      components/FavoriteButton.jsx  # the heart: card, mobile photo, details «حفظ»
      pages/FavoritesPage.jsx
    notifications/
      notificationsApi.js      # list, unread count, mark one / all read (6.11) — optimistic count
      useUnreadCount.js        # the polled unread count (60 s + on focus), skipped for guests
      components/              # NotificationsBell, NotificationsMenu (the dropdown), NotificationItem, UnreadBadge
      pages/NotificationsPage.jsx
    dashboard/pages/DashboardPage.jsx
    admin/
      adminApi.js              # pending queue, review, approve, reject (6.10)
      pages/                   # PendingPropertiesPage, ReviewPropertyPage
      components/              # AdminShell (sidebar), ReviewDocumentCard, RejectPropertyDialog
    ui/uiSlice.js              # theme (+ future UI-only state)
  components/
    ui/                        # Button, Input, Select + SelectMenu (the one dropdown list), Textarea, Checkbox, Modal, ConfirmDialog, Badge, VerifiedBadge,
                               # Spinner, Skeleton, EmptyState, ErrorState, Pagination, Toast
    layout/                    # AppLayout, Header, Footer, MobileTopBar, MobileTabBar, AccountShell (sidebar), PageTopBar
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
 * @property {T[]} items
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
- `sessionStarted` and `sessionEnded` both call `api.util.resetApiState()`: nothing cached for the previous user (or the guest) survives, and public details are refetched with or without the seller phone (6.5). A session that changes in another tab resets the cache the same way.

### 8.5 Logout

Call `POST /logout` with the refresh token, then **always** end the session locally (even if the call fails) and navigate to `/`.

### 8.6 Google sign-in (redirect)

- `GoogleSignInButton` (login and register) is the Figma button (70:1856) with Google's "G". A click calls `startGoogleSignIn` (`features/auth/googleSignIn.js`), which sends the browser to Google's sign-in page: `https://accounts.google.com/o/oauth2/v2/auth` with `client_id`, `redirect_uri=<origin>/auth/google`, `response_type=id_token`, `scope=openid email profile`, a `nonce`, a random `state` and `prompt=select_account`. No Google script is loaded.
- Before leaving, `{ state, returnTo, startPath }` is kept in `sessionStorage` (no token). `returnTo` is the login page's `?redirect=` (or `/`); `startPath` is the page to go back to.
- Google returns to `/auth/google` (`GoogleCallbackPage`, outside `RequireGuest`). `readGoogleCallback` reads `id_token` from the URL fragment, checks the `state`, removes the fragment from the address bar at once, and clears the stored attempt. A cancel on Google (`error=access_denied`) or a wrong/missing state shows a message and «رجوع لتسجيل الدخول», with no API call.
- The idToken goes to `googleSignIn({ idToken })` as is (never decoded). Success → `sessionStarted` → on to `returnTo`. `Identity.GoogleRegistrationIncomplete` → `GoogleProfileStep` (phone + city, `googleProfileSchema`) on the same page, with the token in `useState` only.
- Without `VITE_GOOGLE_CLIENT_ID` the button and the divider are hidden.
- Google Cloud console, OAuth Web client: add `<origin>/auth/google` under **Authorized redirect URIs** for each frontend origin (`http://localhost:5173/auth/google` in development). Without it Google answers `redirect_uri_mismatch`.

### 8.7 Route guards

- `RequireAuth` → redirect to `/login?redirect=<current path>`; after login, return there.
- `RequireGuest` → logged-in users skip `/login` and `/register`.
- `RequireRole role="Admin"` → admin area. Also hide seller actions ("أضف عقاراً") and the favorite heart from admins — admins never post, own, or favorite listings.

---

## 9. Forms (React Hook Form + zod)

- Every form: `useForm({ resolver: zodResolver(schema), mode: 'onTouched' })`.
- Schemas **mirror the backend rules in section 6 exactly** (lengths, regexes, required fields), with Arabic messages. The client check is for UX; the server stays the authority.
- On submit error, run the error through `problemDetails.js`: `fieldErrors` → `setError(field, { message })`; anything else → a form-level alert above the submit button.
- Disable the submit button and show a spinner while submitting. Never allow double submit.
- Enum fields are dropdowns fed from `constants.js` (`ListingSelect` / `Select`, both on the shared `SelectMenu` listbox, bound with `useController`): Arabic label shown, API value submitted. No native `<select>` — its browser-drawn list is unreadable in dark mode.
- Numbers (`price`, `area`) with `valueAsNumber` or a zod `coerce`; send numbers, not strings.
- Optional text fields: send `null` (not `""`) when empty.
- Password fields: show/hide toggle and a live checklist of the four rules.

---

## 10. Maps — HERE

### 10.1 Setup

The library is loaded at runtime from HERE's CDN (`https://js.api.here.com/v3/3.1/` — `mapsjs-core`, `-service`, `-mapevents`, `-ui` and `mapsjs-ui.css`), in order, the first time a map mounts (`src/lib/maps/platform.js`). The npm package (`@here/maps-api-for-javascript`, on HERE's own registry in `.npmrc`) could not be installed: that registry is blocked in the build environment. Switching to it later only changes `loadHere()`.

The API key is visible in the browser by nature. Restrict it to the app's domains in the HERE platform settings where possible, and keep it only in `VITE_HERE_API_KEY`.

### 10.2 Code layout (`src/lib/maps/`)

- `platform.js` — loads the library once (`loadHere()`), creates **one** `H.service.Platform({ apikey })` lazily and reuses it, `hasMapKey()`, and the default view.
- `HereMap.jsx` — generic map component: `useRef` container + `useEffect` that creates `H.Map` with `platform.createDefaultLayers().vector.normal.map`, adds `new H.mapevents.Behavior(new H.mapevents.MapEvents(map))` and `H.ui.UI.createDefault(map, layers)`, listens to window resize → `map.getViewPort().resize()`, and **disposes on unmount** (`map.dispose()`). Props: `center`, `zoom`, `marker` (one), `onPick`, `label`, `className`, `fallback` (rendered when the library can't load).
- `LocationPicker.jsx` — used in the create-listing form: click (or drag the marker) to set a point. Convert the tap with `map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY)`. Reports `{ latitude, longitude }` through `onPick`; the form keeps them in two text fields (`setValue`), which also work without a map.
- `geocoding.js` — thin wrappers over HERE Geocoding & Search (REST, same API key):
  - reverse geocode after picking a point → suggest `fullAddress` / `city` (the user can edit; never overwrite something they typed)
  - address search box → move the map to the result
  - request Arabic results (`lang=ar`) and restrict to the area around Palestine.
- Pages without a map never download the library: it is loaded only when `HereMap` mounts.

### 10.3 Behaviour

- Default view: centered on Palestine, roughly `{ lat: 31.9, lng: 35.2 }`, zoom ≈ 8.
- Details page: a single marker at the listing's `latitude`/`longitude`, no dragging.
- Keep the map inside a fixed-height container with rounded corners; on mobile it collapses behind a "عرض على الخريطة" button.
- If the key is missing or the library fails to load, show a static fallback card with the address text — the page must still work.

---

## 11. Pages and routes

API paths below are relative to the base paths in section 6.1.

| Path | Access | Page | API |
|---|---|---|---|
| `/` | public | Home: hero with search box, type categories, the four latest listings | `GET /User/Properties?pageSize=4` |
| `/properties` | public | Search with filters sidebar (drawer on mobile), sort, pagination; sold/rented ribbon on cards | `GET /User/Properties` |
| `/properties/:id` | public | Details: gallery, key facts, description, map, seller card (phone rule, 6.5), heart | `GET /User/Properties/{id}` |
| `/login` | guest | Login + Google | `POST /login`, `POST /google` |
| `/register` | guest | Sign-up + Google | `POST /register`, `POST /google` |
| `/register/check-email` | guest | "Check your email" + resend | `POST /resend-confirmation` |
| `/auth/google` | public | Google sends the user back here; signs in, or asks phone + city the first time | `POST /google` |
| `/confirm-email` | public | Confirms from the email link | `POST /confirm-email` |
| `/forgot-password` | guest | Ask for a reset code | `POST /send-reset-password-code` |
| `/reset-password` | guest | Code + new password | `POST /change-password` |
| `/dashboard` | user | Buyer-first dashboard; "My listings" block only if they have any | `GET /User/Properties/mine`, `GET /User/Properties` |
| `/properties/new` | user (not admin) | Create listing (multi-step form + location picker) → media step (images + document) | `POST /User/Properties`, media endpoints (6.7) |
| `/my-properties` | user | Own listings with thumbnails, moderation badges, and rejection reasons | `GET /User/Properties/mine` |
| `/my-properties/:id` | user | Owner page: state badge, rejection alert, readiness checklist, actions (6.8), media manager | `GET /User/Properties/mine/{id}` + actions |
| `/my-properties/:id/edit` | user | Edit details + description | `PUT …/details`, `PUT …/description` |
| `/favorites` | user | Favorites grid (12 per page, `?page=`), cards leave at once when unsaved; sidebar and dashboard link here with the ids count | `GET /User/Favorites`, `GET /User/Favorites/ids` |
| `/notifications` | signed in (user or admin) | All notifications (20 per page, `?page=`), grouped by day, unread on brand/subtle, mark all read; the account sidebar and the mobile dashboard link here with the unread count | `GET /User/Notifications`, `GET …/unread-count`, `POST …/{id}/read`, `POST …/read-all` |
| `/admin` | admin | Redirects to the queue | — |
| `/admin/properties` | admin | Pending queue | `GET /Admin/Properties/pending` |
| `/admin/properties/:id` | admin | Review page, document link, approve, reject | `GET /Admin/Properties/{id}` + actions |
| `*` | public | 404 | — |

### Search state lives in the URL

Filters, sort, and page are stored in the query string (`useSearchParams`), not in Redux, so results are shareable and survive refresh. `searchFilters.js` parses the URL into the API params (dropping empty and invalid values) and builds the URL back. Changing any filter resets `page` to 1. The text search runs on submit (header and home search boxes), not while typing. `city`, `propertyType`, `paymentType`, `landClassification` and `legalStatus` take several values (checkboxes), sent as a repeated name (`?city=نابلس&city=جنين`); `toApiQuery` returns a query string because RTK Query would join a list with commas. Only city names from `CITIES` are kept (at most 20). `propertyStatus` stays a single choice. The home city cards, the hero search and `searchPath` start a search with one city.

### Every data-driven screen has four states

Loading (skeletons, not spinners, for lists and cards) · empty (friendly Arabic message plus a next action) · error (message + retry, with `requestId` for 500s) · success.

---

## 12. Redux / RTK Query rules

- **Server data only through RTK Query.** Never copy API data into a slice.
- Slices: `auth` and `ui`. Add another only for real client-only state, and say why.
- Endpoints live in `src/features/<feature>/<feature>Api.js` with `baseApi.injectEndpoints`, like `authApi.js`.
- Tag types:

  | Tag | Provided by | Invalidated by |
  |---|---|---|
  | `Property` (`LIST`, `id`) | search, details | approve, reject, every seller mutation on that id, delete |
  | `MyProperties` | `/mine` | create, every seller mutation, delete |
  | `MyProperty` (`id`) | `/mine/{id}` | every seller mutation on that id |
  | `Favorites` | favorites list | add, remove |
  | `FavoriteIds` | `/ids` | add, remove — patched optimistically; invalidated only after the `409` / `404` "already" answers |
  | `PendingProperties` | admin queue | approve, reject |
  | `ReviewProperty` (`id`) | admin review | approve, reject |
  | `Notifications` | notifications list | mark read, mark all read — patched optimistically |
  | `UnreadCount` | `/unread-count` | mark read, mark all read — patched optimistically |

- The whole API cache is reset when a session starts and when it ends (section 8.4), because public responses differ for guests and signed-in users.
- Keep query args plain and serializable (an object of primitives) so caching works.
- Use generated hooks (`useGetPropertiesQuery`, …) in pages. `skip` when a required arg is missing.
- Don't set a long `keepUnusedDataFor` — the server already caches public responses for 10 minutes.
- Never cache the admin document link beyond `ownershipDocumentExpiresAtUtc` (6.10).

---

## 13. `BACKEND_REQUESTS.md`

The contract gap list between this repo and the backend, at the repo root. Format per entry:

```md
## <number>. <short title>
- Status: open | partly done | done
- Why the frontend needs it:
- Endpoint / change wanted: (method, path, request/response shape)
- Current workaround in the UI:
```

When Abdulrahman confirms something is done: mark it `done`, update section 6 of this file, then remove the workaround.

### Status on 2026-10-01

| # | Title | Status |
|---|---|---|
| 1 | Allow guests to browse | done |
| 2 | Confirmation email to the frontend | done |
| 3 | Error code on non-validation ProblemDetails | open — codes exist only as keys inside `400` `errors` |
| 4 | Current user endpoint | open |
| 5 | Arabic messages for account endpoints | done |
| 6 | Register ignores `bio` and `profileImageUrl` | open |
| 7 | Richer search results | partly done — `mainImageUrl` added; `createdAtUtc` and coordinates missing |
| 8 | Owner details endpoint | done — `GET /User/Properties/mine/{id}` |
| 9 | Currency | open |
| 10 | CORS for deployment | partly done — only `http://localhost:5173` is allowed |
| 11 | Image and document upload | done — section 6.7 |
| 12 | Section 6.12 features | partly done — notifications done; see 6.12 for the rest |
| 13 | Register without a user name | open |
| 14 | Password reset by link or code | open |
| 15 | `requestId` on every ProblemDetails | done — with `instance`, on every error |
| 16 | Several values per search filter | done — city, type, status, payment, land class, document; ≤ 20 cities |

---

## 14. Build order

Each step ends in a working app, and each is its own branch + PR.

### Phase 1 — done

1. **Scaffold** — Vite + React (JS), Tailwind v4, Cairo, RTL, ESLint/Prettier, folder structure, env config, Vite proxy, `.npmrc`, `BACKEND_REQUESTS.md`.
2. **Design system** — tokens (light/dark), theme toggle, `components/ui` primitives, `ConfirmDialog`, `VerifiedBadge`, layout (header, footer, mobile bars), 404 page.
3. **API + auth core** — `baseApi`, `baseQueryWithReauth` with the mutex, `authSlice` + persistence, `problemDetails.js`, route guards.
4. **Auth screens** — register → check email → confirm email → login → forgot/reset password → logout. Then the Figma design audit (`DESIGN.md`).

### Phase 2 — from the 2026-09-30 contract

1. **Contract update** — this file + `BACKEND_REQUESTS.md`, new base paths, `problemDetails.js` understands error-code keys, API cache reset on login/logout.
2. **Browse and details** — home, search with URL-synced filters, pagination, `PropertyCard` with `mainImageUrl` and the sold/rented ribbon; details page with gallery, key facts, seller card with the phone rule, HERE map with a single marker; skeleton/empty/error states.
3. **Create listing + media** (done) — multi-step form, `LocationPicker` + reverse geocoding, then the media step after create: sequential image upload, document upload, readiness checklist.
4. **Owner area** (done) — `/my-properties` with thumbnails, `/my-properties/:id` with state badge, rejection alert, checklist and every action from 6.8 (with confirm dialogs), media manager, `/my-properties/:id/edit`; the buyer-first dashboard.
5. **Favorites** (done) — `/ids` + heart everywhere, `/favorites` page.
6. **Admin moderation** (done) — queue, review page, document link, approve, reject dialog.
7. **Notifications** (done) — bell with the polled unread badge and dropdown, `/notifications` page, sidebar link.
8. **The rest** — as backend endpoints land (section 6.12 and `BACKEND_REQUESTS.md`).

Every data screen keeps the four states (loading skeleton · empty · error with retry · success).

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
