# Judhur (جذور) — Frontend

> Project context for Claude Code working in the **frontend repository**. Read this whole file before writing code.
> The backend lives in a **separate repository** that you cannot see. Section 6 (API contract) is your only source of truth for the backend — never guess an endpoint, a field name, or a status code.
>
> Contract snapshot taken from the backend source on 2026-09-30 (backend `main` + the `feature/Favorite` branch); notifications, my profile and the public seller page added 2026-10-01; security hardening (error `code`, image moderation, limits, rate limits) added 2026-10-04; reports added 2026-10-14; conversations and the real-time hub added 2026-10-15; seller reviews added 2026-10-15; admin users, the admin dashboard, bans and the global rate limit added 2026-10-15 (from the backend source, `main` after `feature/admin-users`).
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
| Real time | `@microsoft/signalr` | One hub connection, section 6.17 |
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

Enums arrive from the API as **strings** (section 6.1). Keep this mapping in `src/features/properties/constants.js` (the report enums in `src/features/reports/constants.js`) and never display a raw enum value.

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
| ReportReason | `Fraud` | احتيال |
| | `IncorrectInformation` | معلومات غير صحيحة |
| | `Duplicate` | إعلان مكرر |
| | `InappropriateContent` | محتوى غير لائق |
| | `Other` | سبب آخر |
| ReportStatus | `Pending` | قيد المراجعة |
| | `Resolved` | تم اتخاذ إجراء |
| | `Dismissed` | لا توجد مخالفة |

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
      // The SignalR hub (6.17): WebSockets go through the proxy too.
      '/hubs': {
        target: 'https://localhost:7000',
        changeOrigin: true,
        secure: false,
        ws: true,
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
| Public seller page | `/api/v1/User/Sellers/...` | yes |
| Reports (reporter) | `/api/v1/User/Reports/...` | yes |
| Conversations | `/api/v1/User/Conversations/...` | yes |
| Reviews (reviewer) | `/api/v1/User/Reviews/...` | yes |
| Real-time hub (SignalR) | `/hubs/chat` | no |
| Admin moderation | `/api/v1/Admin/Properties/...` | yes |
| Admin reports | `/api/v1/Admin/Reports/...` | yes |
| Admin users | `/api/v1/Admin/Users/...` | yes |
| Admin dashboard | `/api/v1/Admin/Stats` | yes |

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
| `GET /User/Sellers/{id}` and `GET /User/Sellers/{id}/reviews` | ✅ | ✅ | ✅ |
| `/User/Reviews/*` | `401` | ✅ | `403` |
| `/User/Reports/*` | `401` | ✅ | `403` |
| `/User/Conversations/*` | `401` | ✅ | `403` |
| `/hubs/chat` | `401` | ✅ | ✅ (notifications only) |
| `/Identity/Account/me*` (6.12) | `401` | ✅ | ✅ |
| `/Admin/Properties/*`, `/Admin/Reports/*`, `/Admin/Users/*` and `/Admin/Stats` | `401` | `403` | ✅ |

Admins never create, own, favorite, report, review, or message about listings and sellers. Hide those actions for admins in the UI.

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
| `ReportReason` | `Fraud` `IncorrectInformation` `Duplicate` `InappropriateContent` `Other` | `Other` needs `details` |
| `ReportStatus` | `Pending` `Resolved` `Dismissed` | |

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
  "title": "لازم تأكد بريدك الإلكتروني قبل تسجيل الدخول",
  "status": 403,
  "code": "Identity.EmailNotConfirmed",
  "instance": "POST /api/Identity/Account/login",
  "requestId": "0HN..."
}
```

- The **human-readable message is in `title`**, not `detail`.
- **`code`** — a non-validation error (`401` / `403` / `404` / `409`) carries its stable error code in a top-level `code` (**not** under `errors`): `Identity.EmailNotConfirmed`, `Identity.LockedOut`, `Identity.DuplicateEmail`, `Identity.ConcurrencyFailure`, `Seller.NotFound`, … `toProblem` exposes it as `problem.code` (null when missing). Branch on `code` where the meaning matters (login `403`, register `409`), else on `status`. `applyServerErrors` puts a mapped `code` on its form field with the `title` as the message.
- A middleware `401`/`403`, a `429` or a `500` may still have no `code` — keep the `status` fallback.
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
- `429 Too Many Requests` may have an empty body — always handle it by status. **Every endpoint is rate limited** (a fixed one-minute window: **300 requests per signed-in user**, **200 per IP for guests**; the hub is not limited), on top of the tighter per-endpoint limits listed in each section. A `429` carries a `Retry-After` header in whole seconds when the limiter knows it. `baseQueryWithReauth` shows one toast «طلبات كثيرة، حاول بعد قليل» (with the seconds when the header is there), never retries on its own, and a `429` never ends the session (a refresh answered with `429` keeps it).
- **Banned accounts** (6.19): `login`, `google` and `refresh-token` answer `403` with `code: "Identity.AccountBanned"` and the title «تم حظر حسابك. للاستفسار تواصل مع إدارة جذور.»; any other request with a banned user's token is a `401` (the token is rejected), whose refresh then gets that `403`. A ban also deletes every refresh token of the user.
- `401`/`403` produced by the auth middleware itself (missing/expired token, wrong role) may have an empty body or a bare ProblemDetails without a meaningful `title`.

One helper, `src/lib/http/problemDetails.js`, turns any RTK Query error into `{ status, message, fieldErrors, errorCodes, code, requestId }` (field keys camelCased, error-code keys kept as sent). Use it everywhere; forms go through `components/form/applyServerErrors.js`.

### 6.3 Account endpoints — `/api/Identity/Account`

All bodies are JSON. None of these require an `Authorization` header (the `/me` endpoints are in 6.12).

#### `POST /register`

```json
{
  "fullName": "string (required, ≤150)",
  "email": "string (required, valid email, ≤256)",
  "phoneNumber": "string (required, see regex)",
  "city": "string (required, ≤100)",
  "bio": "string | null (≤1000)",
  "password": "string (required, ≥8, one uppercase, one lowercase, one digit)"
}
```

- `201 Created`, **empty body**. The backend emails a confirmation link. Navigate to a "check your email" screen that offers "resend".
- `400` validation · `409` duplicate email: `code: "Identity.DuplicateEmail"` → `setError('email', title)`.
- Rate limit: **5 / 15 min / IP** → `429` (the standard rate-limit message).
- Phone regex (Palestinian/Israeli mobile formats): `^(?:\+?(?:970|972)\d{9}|05\d{8})$`
- There is **no user name**: the email is the login. Don't send `userName` or `profileImageUrl` (the photo is uploaded later on `/profile`, 6.12).

#### `POST /login`

```json
{ "email": "string", "password": "string" }
```

- `200` → `TokenResponse`:
  ```json
  { "accessToken": "jwt", "refreshToken": "base64 string", "expiresOnUtc": "2026-09-25T12:30:00+00:00" }
  ```
- `401` wrong email or password.
- `403` with a `code`:
  - `Identity.EmailNotConfirmed` → the server message plus a "resend confirmation email" link (to `/register/check-email?email=…&from=login`, where resend is available at once).
  - `Identity.LockedOut` (5 failed attempts → locked for 5 minutes) → the server message only, no resend link.
- `400` validation.
- Rate limit: **10 / minute / IP** → `429` (the standard rate-limit message).
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
- A successful reset **ends every session** of that account (all devices sign in again).
- Rate limit: **5 / 15 min / IP** → `429`.
- Flow: `/forgot-password` (email) → `/reset-password?email=…` (code + new password). Show a 5-minute countdown and a "send a new code" button.

#### `POST /refresh-token`

```json
{ "refreshToken": "string", "expiredAccessToken": "string" }
```

- `200` → a **new** `TokenResponse` (new access token **and** new refresh token; the old refresh token is dead).
- `401` session expired or replaced, or the access token is malformed; `404` if the user no longer exists → in every failure case, clear the session and go to login.
- ⚠️ The **old access token is required** in the body. That's why both tokens are persisted (section 8.3).
- Refresh tokens are **single-use**: if two refreshes with the same token race, the second gets `401`. So only one refresh may run at a time, across tabs too (section 8.4).
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

// MyProfile — GET /me (6.12)
{
  id: string, fullName: string, email: string, phoneNumber?: string, city: string,
  bio?: string, profileImageUrl?: string,
  roles: string[], hasPassword: boolean,   // hasPassword false = a Google-only account
  createdAtUtc: string
}

// SellerProfile — GET /User/Sellers/{id} (6.13); never the email or the phone
{ id: string, fullName: string, profileImageUrl?: string, city: string, bio?: string, memberSinceUtc: string, activeListingsCount: number,
  averageRating?: number,        // missing without reviews (6.18)
  reviewsCount: number }

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
| `sellerId` | guid | — | only that seller's listings — the public seller page (6.13) |

- `200` → `PaginatedList<PropertySummary>`.
- Returns approved **and** active listings only. Without a `propertyStatus` filter this **includes `Sold` and `Rented`** — show a "تم البيع" / "تم التأجير" ribbon on those cards.
- **Several values:** a repeatable param is sent once per value (`?city=نابلس&city=جنين&paymentType=Cash`), never comma-joined. Values of one filter are **OR**, different filters are **AND**. A single value still works.
- `400` invalid `page`/`pageSize`, an invalid enum value, or more than 20 cities (`PropertyErrors.TooManyCitiesInFilter` — show its message).
- ⚠️ Still no `createdAtUtc` or coordinates on summaries (backend request #7). The map page reads each result's coordinates from its details meanwhile (section 10.3).

#### `GET /{propertyId}` — details

```ts
{
  id, title, description?, price, paymentType, propertyType, propertyStatus,
  area, city, region?, fullAddress, latitude, longitude,
  landClassification, legalStatus,
  user: UserInfo,                // the seller
  sellerRating: { averageRating?: number, reviewsCount: number },   // the seller's reviews (6.18); averageRating missing without reviews
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

- Rules: `0 < price ≤ 1,000,000,000,000` (`400` `PropertyErrors.PriceTooHigh`), `0 < area ≤ 10,000,000` (`400` `PropertyErrors.AreaTooHigh`), `propertyStatus` **must be `ForSale` or `ForRent`**, latitude −90…90, longitude −180…180, all enums must be valid names. The same limits apply to `PUT /details`; the forms check them too and put the two codes on the price / area fields.
- There is **no** `ownershipDocumentUrl` — the document and the images are uploaded after creation (6.7).
- `201` → the details shape with `images: []` and **no** `user`, plus a `Location` header pointing to `GET /User/Properties/mine/{id}`. The listing starts `Pending`.
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
- ⚠️ On an **approved** listing, adding an image sends it back to `Pending` (hidden from search until approved again) → the same confirm dialog as editing details first. On a **rejected** listing, show a note that it goes back to review.
- `400` `Storage.InvalidFileContent` when the file's content does not match its type (also on the document and profile-photo uploads) → show it on that upload.
- ⚠️ **Upload images one at a time** (await each request before the next). Parallel uploads can collide on the image order and return the database `409` from 6.2.
- Validate type and size on the client before uploading.

#### `DELETE /{propertyId}/images/{imageId}`

- `204`.
- `400` `PropertyErrors.CannotRemoveMainImage` — set another image as main first. Disable the delete button on the main image.
- `400` `PropertyErrors.MinImagesRequired` — an **approved** listing must keep at least 3 images.
- `404` image or listing not found.

#### `PUT /{propertyId}/images/{imageId}/main`

- `204` · `404`.
- ⚠️ On an **approved** listing it sends the listing back to `Pending` → confirm first, like adding an image.
- After either change: invalidate `MyProperty(id)`, `MyProperties`, `Property` and `SellerProfile`.

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
- `resubmit` clears the rejection reason and puts the listing back in the admin queue. Deleting an image does not reset moderation, so after such a fix the owner resubmits. The button stays disabled until the readiness checklist is complete.
- `reactivate` is offered for any approved, inactive listing — a sold or rented one included.

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

`User` and `Admin` both have notifications. Today the backend sends them to the seller when an admin approves, rejects or suspends a listing, to the reporter when an admin closes their report, to the seller when someone reviews them, and to a user an admin bans (`AccountBanned`, no `referenceId`; the body has the reason and how many listings were paused).

```ts
// Notification
{
  id: string,
  type: 'PropertyApproved' | 'PropertyRejected' | 'PropertySuspended' | 'ReportResolved' | 'NewReview' | 'AccountBanned',   // more types will come later
  title: string, body: string,                     // Arabic, written by the server — show them as they are
  referenceId?: string,                            // the listing id for the three property types, the report id for ReportResolved, the seller id (me) for NewReview
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

- **Bell** in the navbar for every signed-in user (`NotificationsBell`): the unread badge (hidden at `0`) from `GET /unread-count`, refetched on window focus, skipped for guests (`useUnreadCount`). It is polled every 60 s **only while the real-time hub is disconnected**; connected, the hub pushes `notificationReceived` (6.17). A click opens the latest 5 (`pageSize=5`, refetched on each open), «تعليم الكل كمقروء» and «عرض الكل» → `/notifications`.
- **Opening a notification** calls `POST /{id}/read` without checking `isRead`. `PropertyApproved`, `PropertyRejected` and `PropertySuspended` then go to `/my-properties/{referenceId}`; `ReportResolved` (sent for a resolved **and** a dismissed report) goes to `/my-reports`; `NewReview` goes to `/sellers/{referenceId}#reviews` (my own seller page, the reviews tab); any other type is only marked as read. `AccountBanned` pushed by the hub ends the session at once (6.17).
- Icons: approved check (success), rejected flag (danger), suspended pause (danger), report reviewed flag (info), new review star (warning). Unknown types get the generic bell icon — never hide or break on a new type.
- Marking read is optimistic: the cached pages and the unread count change at once, are undone on failure, and are refetched after.

### 6.12 My profile — `/api/Identity/Account/me` (token required, any role)

#### `GET /me`

- `200` → `MyProfile` (6.4). RTK Query `getMe`, tag `MyProfile`, read through `useMyProfile()` (skipped for guests).
- Loaded on app start when a session exists, and right after `/login` and `/google` (`startSession` in `authApi.js`). The session reset on logout drops it.
- The header shows `fullName` and `profileImageUrl` (fallback: the first letter in the brand/subtle circle); the dashboard welcome uses the first name.

#### `PUT /me`

```json
{ "fullName": "string (required, ≤150)", "phoneNumber": "string (required, register regex)", "city": "string (required, ≤100)", "bio": "string | null (≤1000)" }
```

- **Always send all four.** An empty bio is sent as `null` and clears it. The email is shown read-only.
- `200` → the updated `MyProfile`: written into the `getMe` cache with `updateQueryData`, no refetch. Also invalidates `Property` and `SellerProfile` (the seller box and the seller page show the name).
- `400` validation (field keys as usual) · `409` `code: "Identity.ConcurrencyFailure"` → show the message; sending again retries.

#### `PUT /me/photo` and `DELETE /me/photo`

- `PUT`: `multipart/form-data` with the field `file` — JPG, PNG or WEBP, max 5 MB; check both on the client first and never set `Content-Type` yourself. `200` → `{ profileImageUrl }` → patch the `getMe` cache.
- `DELETE`: `204` → set `profileImageUrl` to `null` in the cache. Behind a confirm dialog.
- Both invalidate `Property` (the seller box on listing pages shows the photo) and `SellerProfile`.

#### `PUT /me/password`

```json
{ "currentPassword": "string? (required when hasPassword)", "newPassword": "string (register rules, different from the current one)" }
```

- `204`; the session stays valid. Success toast.
- `hasPassword: true` → «تغيير كلمة المرور»: current, new, confirm. `400` `Identity.CurrentPasswordRequired` / `Identity.PasswordMismatch` → under the current password field.
- `hasPassword: false` (a Google account) → «تعيين كلمة مرور»: new and confirm only; after success set `hasPassword` to `true` in the cache.
- `429` after 5 tries in 15 minutes → the rate-limit message.

### 6.13 Public seller page — `/api/v1/User/Sellers` (public)

#### `GET /{sellerId}`

- `200` → `SellerProfile` (6.4), tag `SellerProfile` (`id`). `404` (`code: "Seller.NotFound"`) → «البائع غير موجود».
- The page `/sellers/:id` shows the photo, name, the rating (stars, `averageRating` with one decimal, «(N تقييم)», 6.18), city, «عضو منذ» (month and year of `memberSinceUtc`) and bio, then two tabs: «عقاراته (activeListingsCount)» — the seller's listings from `GET /User/Properties?sellerId={id}&page=&pageSize=` with `PropertyCard` and `Pagination` (`?page=`) — and «التقييمات (reviewsCount)» (`#reviews`, 6.18).
- **Never** shows an email or a phone. The seller box on the listing details page (`user.id`) links here.

### 6.14 Not built yet on the backend

Nothing below exists — don't call it. Build nothing that depends on it without a `BACKEND_REQUESTS.md` entry.

- Delete account, account preferences (email notifications, phone visibility)
- Message attachments
- AI price estimation
- Currency on prices (still `DEFAULT_CURRENCY`)
- The AI-usage screen (in Figma, no endpoint)

### 6.16 Conversations — `/api/v1/User/Conversations` (role `User`)

A conversation is one buyer and one seller about one listing.

```ts
// Message
{ id, conversationId, senderId, content, sentAtUtc, readAtUtc?, isMine }      // readAtUtc: when the recipient read it

// ConversationProperty
{ id, title, mainImageUrl?, isAvailable }                                     // isAvailable false once the listing is hidden

// ChatParticipant
{ id, fullName, profileImageUrl? }

// ConversationSummary — GET /
{ id, property: ConversationProperty, otherParty?: ChatParticipant, myRole: 'Buyer' | 'Seller',
  lastMessagePreview?, lastMessageIsMine, lastMessageAtUtc?, unreadCount }

// ConversationDetails — GET /{id}
{ id, property: ConversationProperty, otherParty?: ChatParticipant, myRole, createdAtUtc }
```

| Method | Route | Success | Errors |
|---|---|---|---|
| `POST` | `/` `{ propertyId, message }` | `201` new / `200` existing → `{ conversationId, isNew, message: Message }` | `404` listing not public · `409` `code: "ConversationErrors.CannotStartConversationWithSelf"` · a plain database `409` (no `code`) on a double click → ask once more · `429` |
| `GET` | `/?page=&pageSize=` | `200` `PaginatedList<ConversationSummary>`, latest first | `400` |
| `GET` | `/unread-count` | `200` `{ count }` (unread **messages**) | — |
| `GET` | `/{id}` | `200` `ConversationDetails` | `404` missing or not yours |
| `GET` | `/{id}/messages?before=&limit=` | `200` `{ items: Message[] (newest first), hasMore }` | `400` `ConversationErrors.InvalidCursor` |
| `POST` | `/{id}/messages` `{ content }` | `201` `Message` | `400` (content 1–2000 after trim) · `429` → «أرسلت رسائل كثيرة، انتظر قليلًا» |
| `POST` | `/{id}/read` | `204` | `404` |

- **Messages paging:** the first page has no `before`; an older page sends `before` = the id of the oldest message shown. `limit` defaults to 30 (max 100). RTK Query `getMessages` is an **infinite query** (`useGetMessagesInfiniteQuery`): `getNextPageParam` returns the oldest id while `hasMore`. New messages (sent, or pushed by the hub) are added to the cached first page (`addMessageToChat`, deduped by id) — never by refetching every page.
- **Contact the seller:** «تواصل مع البائع» on the public details page (the price card from 1280px up, the mobile action bar below) for a signed-in `User` who is not the owner; guests get a login link that comes back; admins and the owner see the phone button only. It opens a dialog with the message prefilled «مرحبًا، هل العقار ما زال متاحًا؟». Success → `/messages/{conversationId}`; invalidates `Conversations` and `UnreadMessages`.
- **Inbox `/messages`:** per conversation the other party (avatar + name, «مستخدم محذوف» when missing), the listing thumbnail + title, «الإعلان لم يعد متاحًا» when `!property.isAvailable`, the preview prefixed «أنت: » when `lastMessageIsMine`, the relative time, the unread count and a role chip (`myRole`: مشترٍ / بائع). 20 per page (`?page=`). From 1280px up the list and the open chat sit side by side (Figma 76:968); on phones the list and the chat are separate pages (84:530).
- **Chat `/messages/:conversationId`:** header from `GET /{id}` (the other party, a property card linking to `/properties/{property.id}` or the unavailable note); the messages reversed for display (oldest at the top), mine at the end in brand, theirs at the start (Figma Chat Bubble 47:799), the time, ✓ / ✓✓ on mine (`readAtUtc`), a day pill when the day changes. Scrolling to the top (or «تحميل رسائل أقدم») loads the older page and keeps the scroll position. Composer: Enter sends, Shift+Enter adds a line, disabled while sending, counter from 1800 to 2000; the answer is added to the chat.
- **Read:** when the chat is open and visible and has unread messages from the other party (on open and on every new one), `POST /{id}/read`; the cache marks them read at once, then `UnreadMessages` and `Conversations` are invalidated.
- **Unread badge:** `useUnreadMessages()` (`GET /unread-count`) on the navbar chat icon, the account sidebar «المحادثات», the mobile tab bar and the mobile dashboard row; refetched on focus, polled every 60 s only while the hub is disconnected.

### 6.17 Real time — SignalR hub `/hubs/chat`

- **One connection** (`src/lib/realtime/chatHub.js`) to `${API_BASE_URL}/hubs/chat`, built with `HubConnectionBuilder().withUrl(url, { accessTokenFactory }).withAutomaticReconnect()`. `accessTokenFactory` is `freshAccessToken(store)` from `baseQuery.js`: the existing refresh (mutex + cross-tab lock) runs first when the token has expired or is about to. In development the Vite proxy forwards `/hubs` with `ws: true`.
- SignalR sends the token as `access_token` in the WebSocket URL (browsers can't set headers there) — the one place a token is in a URL, required by the protocol; never log that URL.
- **Lifecycle:** started on app start when a session exists and on `sessionStarted` / `sessionRefreshed` (a session that arrives from another tab); stopped on `sessionEnded`. The server closes the connection when the token expires: `onclose` starts it again with a fresh token while still signed in (retry after 2 s, then up to 30 s). Admins connect too (notifications).
- `ui.isRealtimeConnected` (ui slice) says whether the hub is connected; the two unread counts poll only while it is `false`.
- **Events from the server:**

| Event | Payload | What the client does |
|---|---|---|
| `messageReceived` | `Message` | Open chat with that id: add it (deduped), and it is marked read while visible. Otherwise: `UnreadMessages` count +1 (not for my own). Always invalidate `Conversations` (an unknown conversation shows up that way). |
| `messagesRead` | `{ conversationId, readAtUtc }` | Set `readAtUtc` on my unread messages of that chat (✓✓). |
| `notificationReceived` | `Notification` (6.11) | Prepend it to the cached first page of notifications, `UnreadCount` +1, a small toast with its `title`. Type `AccountBanned`: end the session at once (`sessionEnded('banned')`) and show its `body` instead. |

- **On reconnect** (and on window focus) refetch `Conversations`, `UnreadMessages`, `UnreadCount`, `Notifications` and the open chat: anything sent while disconnected, and my own messages sent from another tab (the hub does not echo them), is caught up.

### 6.15 Reports — `/api/v1/User/Reports` (role `User`) and `/api/v1/Admin/Reports` (role `Admin`)

```ts
// MyReport — GET /User/Reports/mine
{ id, propertyId, propertyTitle, reason: ReportReason, details?, status: ReportStatus, adminNote?, createdAtUtc, reviewedAtUtc? }

// ReportSummary — GET /Admin/Reports
{ id, propertyId, propertyTitle, propertyIsDeleted, reason, status, pendingReportsOnProperty, createdAtUtc, reviewedAtUtc? }

// ReportDetails — GET /Admin/Reports/{id}
{
  id, reason, details?, status, adminNote?, createdAtUtc, reviewedAtUtc?,
  reporterId, reporter?: UserInfo,          // missing if the reporter account no longer exists
  property: { id, title, city, moderationStatus, isActive, isDeleted, mainImageUrl?, sellerId },
  otherPendingReportsOnProperty: number
}
```

#### `POST /User/Reports` — report a listing

```json
{ "propertyId": "guid", "reason": "Fraud", "details": "string | null (≤1000, required when reason is Other)" }
```

- `201` → `{ id }`. Invalidates `MyReports`.
- `400` validation (`Reason`, `Details`) · `404` the listing is not public · `409` `code: "ReportErrors.CannotReportOwnProperty"` · `409` `code: "ReportErrors.DuplicateReport"` (the user already has a pending report on this listing → «لديك بلاغ قيد المراجعة على هذا الإعلان») · `429` after **10 an hour**.
- UI: «إبلاغ» (Figma 65:1169) on the public details page, next to «مشاركة» from 1280px up and as «إبلاغ عن الإعلان» under the safety tips below it. Only for a signed-in `User` who is not the owner (`property.user.id !== ` the JWT `sub`); guests get a login link that comes back; admins see nothing. It opens a dialog: the reason as radio buttons, the details textarea (required for `Other`, counter to 1000), submit. Success toast «تم إرسال البلاغ، سنراجعه قريبًا».

#### `GET /User/Reports/mine?page=&pageSize=`

- `200` → `PaginatedList<MyReport>`, newest first. Tag `MyReports`.
- Page `/my-reports`: status badge, reason, date, the user's details, and «رد الإدارة» with `adminNote` when present. The title links to `/properties/{propertyId}` (which may show «العقار غير متاح» if the listing was hidden).

#### `GET /Admin/Reports?status=Pending|Resolved|Dismissed&page=&pageSize=`

- `200` → `PaginatedList<ReportSummary>`; `Pending` is oldest first. Tag `AdminReports`.
- Page `/admin/reports` (Figma 82:1026): tabs for the three statuses (`?status=`, Pending by default), a «محذوف» badge when `propertyIsDeleted`, a «N بلاغات» badge when `pendingReportsOnProperty > 1`, «افحص» → the review page.

#### `GET /Admin/Reports/{id}`

- `200` → `ReportDetails`; `404` missing. Tag `AdminReport` (`id`).
- Page `/admin/reports/:reportId`: the report, the reporter, a property card (badges for deleted / not published / paused) with a link to `/admin/properties/{property.id}`, and «يوجد N بلاغات أخرى على هذا الإعلان» when `otherPendingReportsOnProperty > 0`.

#### `POST /Admin/Reports/{id}/dismiss` and `POST /Admin/Reports/{id}/resolve`

Only offered while `status === 'Pending'`. Every action goes through a confirm dialog with «ملاحظة للمبلّغ» (`adminNote`, optional, ≤1000, shown to the reporters).

| Button | Request | Effect |
|---|---|---|
| «لا توجد مخالفة» | `POST /{id}/dismiss` `{ adminNote? }` | `204`; closes this report only |
| «اتخاذ إجراء» | `POST /{id}/resolve` `{ adminNote?, suspendProperty: false }` | `204`; closes **all** pending reports on the listing (the dialog says so when `otherPendingReportsOnProperty > 0`) |
| «اتخاذ إجراء وإيقاف الإعلان» | `POST /{id}/resolve` `{ adminNote?, suspendProperty: true, suspensionReason }` | `204`; the same, and the listing becomes `Rejected` with `rejectionReason = suspensionReason` (required, ≤500, shown to the owner). Only when `property.moderationStatus === 'Approved' && !property.isDeleted` |

- `409` `code: "ReportErrors.AlreadyReviewed"` or a concurrency `409` → toast and refetch. `400` on the note / reason → on the dialog fields.
- After any action invalidate `AdminReports` and `AdminReport(id)`; after suspending also `Property` and `PendingProperties` (and `ReviewProperty` of the listing).
- **Owner side:** a suspended listing is just `moderationStatus: 'Rejected'` with the admin's reason, so the rejected owner UI (reason alert, edit, resubmit) covers it; only the `PropertySuspended` notification is new.

### 6.18 Reviews — `/api/v1/User/Sellers/{sellerId}/reviews` (public) and `/api/v1/User/Reviews` (role `User`)

A buyer rates a seller (not a listing), once per seller, after the seller answered them in a conversation. The server decides who may review (`canReview`).

```ts
// SellerReview — GET /User/Sellers/{sellerId}/reviews
{ id, rating, comment?, reviewer?: { fullName, profileImageUrl? }, createdAtUtc, isEdited }   // reviewer missing if the account no longer exists

// Review — my own; POST and PUT answer it
{ id, sellerId, rating, comment?, createdAtUtc, lastModifiedUtc }

// MyReviewStatus — GET /User/Reviews/sellers/{sellerId}/mine
{ canReview: boolean, review?: Review }
```

- `rating`: 0.5 to 5 in steps of 0.5. `comment`: optional, ≤ 500; an empty comment is sent as `null` (on `PUT` it clears it).

| Method | Route | Success | Errors |
|---|---|---|---|
| `GET` | `/User/Sellers/{sellerId}/reviews?page=&pageSize=` | `200` `PaginatedList<SellerReview>`, newest first | `400` |
| `GET` | `/User/Reviews/sellers/{sellerId}/mine` | `200` `MyReviewStatus` | — |
| `POST` | `/User/Reviews` `{ sellerId, rating, comment? }` | `201` `Review` | `400` (`Rating`, `Comment`) · `409` `code: "ReviewErrors.NotEligible"` / `"ReviewErrors.DuplicateReview"` / `"ReviewErrors.CannotReviewSelf"` · `429` after **5 an hour** |
| `PUT` | `/User/Reviews/{reviewId}` `{ rating, comment? }` | `200` `Review` | `400` · `404` |
| `DELETE` | `/User/Reviews/{reviewId}` | `204` | `404` |

- **Seller page, tab «التقييمات» (`#reviews`):** the list (10 per page, `?reviewsPage=`): avatar, name («مستخدم محذوف» when `reviewer` is missing), five stars, the comment, the relative date and «(معدّل)» when `isEdited`; an empty state when there are none. Above it, «تقييمك»:
  - a signed-in `User` who is not this seller (`sellerId !== ` the JWT `sub`) calls `GET /mine`: with `review` → the card «تقييمك» with «تعديل» (the same form, `PUT`) and «حذف» (confirm dialog, `DELETE`); with `canReview` → the form «قيّم هذا البائع» (the star input + the comment with a counter to 500, `POST`); neither → «يمكنك تقييم البائع بعد التواصل معه ورده على رسالتك».
  - a guest → «سجّل الدخول لتقييم البائع» (a login link that comes back to `#reviews`). Admins and the seller themself see nothing there.
- **Shared stars:** `StarRating` (read-only, half stars, the half on the start side so it follows RTL, optional average and «(N تقييم)», «لا توجد تقييمات بعد» at 0) and `StarRatingInput` (clickable half stars, a keyboard slider: arrows ±0.5 — left adds in RTL — Home / End, digits 1–5).
- **Details page:** the seller box shows `sellerRating` (stars, average, «(N تقييم)», or «لا توجد تقييمات بعد») under the seller name, linking to `/sellers/{user.id}#reviews`.
- **After create / update / delete** invalidate `SellerProfile(sellerId)`, `SellerReviews(sellerId)`, `MyReviewStatus(sellerId)` and `Property` (the details show the rating). A `409` (any code, or a database `409` without one) or a `404` means the state changed elsewhere: the same tags are invalidated, so the review area shows the current state; the message is shown as a toast or above the form.

### 6.19 Admin users and dashboard — `/api/v1/Admin/Users` and `/api/v1/Admin/Stats` (role `Admin`)

```ts
// AdminUser — GET /Admin/Users (items) and GET /Admin/Users/{id}
{ id, fullName, email, phoneNumber?, city, profileImageUrl?, isAdmin, emailConfirmed,
  bannedAtUtc?, banReason?, createdAtUtc,
  propertiesCount, activeListingsCount, pendingReportsOnListings }

// AdminStats — GET /Admin/Stats
{
  users: { totalUsers, newUsers, bannedUsers, unconfirmedUsers },          // admins not counted; newUsers = last 7 days
  properties: { published, waitingForReview, incomplete, rejected, inactive, sold, rented },
  pendingReports,
  lastSevenDays: { newUsers, newListings, messages, reviews, reports }
}
```

- `properties.waitingForReview` is the moderation queue (6.10); `incomplete` are pending listings still missing images or the document; `published` is approved and active (sold and rented included).

| Method | Route | Success | Errors |
|---|---|---|---|
| `GET` | `/Admin/Stats` | `200` `AdminStats` | — |
| `GET` | `/Admin/Users?search=&status=&page=&pageSize=` | `200` `PaginatedList<AdminUser>`, newest accounts first | `400` (`search` > 100, bad page) |
| `GET` | `/Admin/Users/{id}` | `200` `AdminUser` | `404` |
| `POST` | `/Admin/Users/{id}/ban` `{ reason }` (required, ≤ 500) | `204` | `400` · `404` · `409` `Users.CannotBanAdmin` / `Users.CannotBanSelf` / `Users.AlreadyBanned` |
| `POST` | `/Admin/Users/{id}/unban` | `204` | `404` · `409` `Users.NotBanned` |

- `search` matches the name, the email or the phone. `status`: `All` (default) · `Active` (confirmed, not banned) · `Banned` · `Unconfirmed` (not banned, email not confirmed).
- **Ban:** signs the user out everywhere (refresh tokens deleted), deactivates their active listings, and notifies them (`AccountBanned`, 6.11). Their seller page answers `404 Seller.NotFound`. **Unban:** they can log in again; the paused listings stay inactive until the owner reactivates them.
- **Dashboard `/admin`** (Figma 80:472): stat cards; `waitingForReview` → `/admin/properties`, `pendingReports` → `/admin/reports`, `bannedUsers` → `/admin/users?status=Banned`. Tag `AdminStats`, refetched on every visit.
- **Users `/admin/users`** (Figma 82:827): tabs «الكل · نشط · محظور · غير مؤكد» (`?status=`), a search box (`?search=`, sent 400 ms after typing stops), 20 per page (`?page=`); per row the avatar, name, email, city, listings, pending reports on their listings and the state badge — a red «محظور» with the date and reason. Admin rows have no ban action. Tag `AdminUsers`.
- **User `/admin/users/:id`:** the profile and counts, «حظر الحساب» (a confirm dialog with the reason, a counter to 500, and what a ban does) or «إلغاء الحظر» (a confirm). The `409` codes show their message. Both invalidate `AdminUsers`, `AdminUser(id)` and `AdminStats`. Tag `AdminUser` (`id`).

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
    profile/
      profileApi.js            # getMe, update, photo upload/delete, password (6.12) — answers patch the getMe cache
      useMyProfile.js          # the signed-in profile (GET /me), skipped for guests
      components/              # ProfileDetailsForm, ProfilePhotoRow, PasswordForm, ProfilePasswordInput, ProfileSubmitButton
      pages/ProfilePage.jsx
    sellers/
      sellersApi.js            # public seller profile (6.13)
      components/SellerHeader.jsx
      pages/SellerPage.jsx
    reviews/
      reviewsApi.js            # seller reviews, my review status, create, update, delete (6.18)
      constants.js             # rating range and step, comment limit, page size
      schemas.js               # the review form (rating + comment)
      components/              # SellerReviewsTab, SellerReviewItem, MyReviewArea, MyReviewCard, ReviewForm
    conversations/
      conversationsApi.js      # start, list, unread count, details, messages (infinite query), send, read (6.16)
      useUnreadMessages.js     # the unread messages count (polled only while the hub is down)
      schemas.js               # message text (1–2000)
      components/              # ContactSellerButton, ContactSellerDialog, ConversationList, ConversationListItem,
                               # ChatHeader, ChatMessages, ChatBubble, ChatComposer
      pages/                   # MessagesPage (inbox + outlet), ChatPage
    reports/
      reportsApi.js            # report a listing, my reports (6.15)
      constants.js             # ReportReason / ReportStatus lists, Arabic labels, badge tones, limits
      schemas.js               # report form (reason + details), admin decision form (note, suspension)
      components/              # ReportListingButton, ReportListingDialog
      pages/MyReportsPage.jsx
    notifications/
      notificationsApi.js      # list, unread count, mark one / all read (6.11) — optimistic count
      useUnreadCount.js        # the polled unread count (60 s + on focus), skipped for guests
      components/              # NotificationsBell, NotificationsMenu (the dropdown), NotificationItem, UnreadBadge
      pages/NotificationsPage.jsx
    dashboard/pages/DashboardPage.jsx
    admin/
      adminApi.js              # pending queue, review, approve, reject (6.10); reports list, review, dismiss, resolve (6.15)
      usersApi.js              # dashboard stats, users list, user, ban, unban (6.19)
      pages/                   # DashboardPage, PendingPropertiesPage, ReviewPropertyPage, ReportsPage, ReviewReportPage,
                               # UsersPage, UserPage
      components/              # AdminShell (sidebar), ReviewDocumentCard, RejectPropertyDialog, ReportDecisionDialog,
                               # StatCard, UserRow, UserStatusBadge (ban / unban use ConfirmDialog)
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
    realtime/chatHub.js        # the SignalR connection and its events (6.17)
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

Actions: `sessionStarted(tokenResponse)`, `sessionRefreshed(tokenResponse)`, `sessionEnded(reason)` — `reason` is `'logout'`, `'expired'` (toast «انتهت جلستك…») or `'banned'` (the caller shows the server's message).
Selectors: `selectIsAuthenticated`, `selectCurrentUser`, `selectIsAdmin`.

### 8.2 Reading the JWT

Decode with `jwt-decode` (decoding only — never trust it for security; the server validates). Claims present:

- `sub` → user id (GUID)
- `email`
- role: the key may be `role` **or** `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`, and the value may be a **string or an array**. Normalize to `roles: string[]` in one function.

There is **no name, phone, or avatar** in the token: they come from `GET /me` (6.12). Until it loads, the header shows the email.

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

- **Use a mutex (`async-mutex`).** The backend keeps exactly one refresh token per user and each one works once. Two parallel refreshes would make the second one fail and log the user out.
- **Across tabs too:** the refresh runs inside `navigator.locks.request('judhur.refresh', …)` (where supported), and first adopts tokens another tab already stored. `clearStoredTokens` clears only the storage area this tab uses (a tab without «تذكّرني» never clears the shared localStorage session).
- Requests that don't use the session never refresh: `/login`, `/logout`, `/refresh-token`, `/google`, `/register`, `/confirm-email`, `/resend-confirmation`, `/send-reset-password-code`, `/change-password`.
- Retry the original request **once**. Never loop.
- If the refresh fails (usually `401`), the session was ended elsewhere (for example a login on another device). End the session and show "انتهت جلستك، الرجاء تسجيل الدخول مجدداً". A `403` `Identity.AccountBanned` ends it as `'banned'` and shows the server's title instead.
- Optional nicety: refresh proactively when `expiresOnUtc` is less than a minute away. The 401 path must still work on its own — the server allows **zero clock skew**.
- `sessionStarted` and `sessionEnded` both call `api.util.resetApiState()`: nothing cached for the previous user (or the guest) survives, and public details are refetched with or without the seller phone (6.5). A session that changes in another tab resets the cache the same way.

### 8.5 Logout

Call `POST /logout` with the refresh token read at click time (`getState`), then **always** navigate to `/` (`replace`) and end the session locally, even if the call fails.

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

The API key is visible in the browser by nature. Restrict it to the app's domains in the HERE platform settings where possible, and keep it only in `VITE_HERE_API_KEY` (`.env.local`). Without a key every map shows its fallback and the pages still work.

**Getting a key:** sign in at `platform.here.com` → *Access Manager* → *Apps* → create an app → *API Keys* → create a key. The free plan covers Maps API for JavaScript, the Raster Tile API (the satellite tiles) and Geocoding & Search. Under the key's *Restrictions* allow the frontend origins (`http://localhost:5173` in development, and the deployed one later).

### 10.2 Code layout (`src/lib/maps/`)

- `platform.js` — loads the library once (`loadHere()`, no duplicate tags on retry), creates **one** `H.service.Platform({ apikey })` lazily and reuses it, `hasMapKey()`, the default view, and `createHereMap(H, element, { center, zoom, defaultUi })`: `H.Map` on the **satellite** layer — `platform.getRasterTileService({ queryParams: { style: 'explore.satellite.day', lang: 'ar' } })` → `H.service.rasterTile.Provider` → `H.map.layer.TileLayer` (satellite photos with roads and Arabic place names), `Behavior` + `MapEvents`, HERE's default UI when `defaultUi` without its map-style menu (`removeControl('mapsettings')`: the map is always satellite), the window-resize listener, and one `dispose()` for all of it.
- `HereMap.jsx` — a map with **one** marker (the picker and the details page), built with `createHereMap` and disposed on unmount. Props: `center`, `zoom`, `marker`, `onPick`, `label`, `className`, `fallback` (rendered when the library can't load). With `onPick`, a tap reports the point and the marker is draggable (`volatility: true`, `draggable = true`; the map's behaviour is paused during the drag, HERE's documented pattern).
- `MarkersMap.jsx` — the map page: one `H.map.DomMarker` price pin per listing in an `H.map.Group` (Figma 71:1398, the chosen pin in brand), the view fitted to the pins when the listings change (`setLookAtData` with the group's bounds, zoom capped at 15), a pin tap → `onSelect(id)`, and the Figma zoom buttons (71:1410) instead of HERE's UI.
- `LocationPicker.jsx` — used in the create-listing form: click (or drag the marker) to set a point. Convert the tap with `map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY)`. Reports `{ latitude, longitude }` through `onPick`; the form keeps them in two text fields (`setValue`), which also work without a map.
- `geocoding.js` — thin wrappers over HERE Geocoding & Search (REST, same API key):
  - reverse geocode after picking a point → suggest `fullAddress` / `city` (the user can edit; never overwrite something they typed)
  - address search box → move the map to the result
  - request Arabic results (`lang=ar`) and restrict to the area around Palestine.
- Pages without a map never download the library: it is loaded only when a map mounts.

### 10.3 Behaviour

- Default view: centered on Palestine, roughly `{ lat: 31.9, lng: 35.2 }`, zoom ≈ 8.
- Every map (details, picker, `/map`) shows the satellite photos, so buyers and sellers see the real buildings and land.
- Details page: a single marker at the listing's `latitude`/`longitude`, no dragging. From 1280px up the map shows at once; on phones it waits behind «عرض على الخريطة», so the library is downloaded only when asked.
- Keep the map inside a fixed-height container with rounded corners.
- **Map page `/map`** (Figma 71:1300): the same search as `/properties` (filters, sort and page in the URL, 12 per page), the list at the start and the map with a price pin per listing; a pin and its row light up together. Search results have **no coordinates yet** (backend request #7), so the page reads each listing's location from `GET /User/Properties/{id}` (`getPropertyLocations`, one query for the page's ids; the details are server-cached). When summaries carry `latitude` / `longitude`, drop that query and read them from the results.
- If the key is missing or the library fails to load, show a static fallback card with the address text — the page must still work.

---

## 11. Pages and routes

API paths below are relative to the base paths in section 6.1.

| Path | Access | Page | API |
|---|---|---|---|
| `/` | public | Home: hero with search box, type categories, the four latest listings | `GET /User/Properties?pageSize=4` |
| `/properties` | public | Search with filters sidebar (drawer on mobile), sort, pagination; sold/rented ribbon on cards | `GET /User/Properties` |
| `/map` | public | Map of the search (Figma 71:1300): filter pills (open the filters sheet), list + price pins, sort, pagination, «عرض كقائمة» | `GET /User/Properties`, `GET /User/Properties/{id}` per result (coordinates, #7) |
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
| `/profile` | signed in (user or admin) | Personal data + photo, password (change, or set for Google accounts); account sidebar for users, admin sidebar for admins; «حسابي» in the account menu | `GET/PUT /me`, `PUT/DELETE /me/photo`, `PUT /me/password` |
| `/sellers/:id` | public | Seller header (photo, name, rating, city, member since, bio), tabs: their listings (12 per page) and «التقييمات» (`#reviews`, my review + the list, 10 per page) | `GET /User/Sellers/{id}`, `GET /User/Properties?sellerId=`, `GET /User/Sellers/{id}/reviews`, `/User/Reviews/*` |
| `/messages` | user | Conversations (Figma 76:968): the list, and from 1280px up the open chat beside it; 20 per page | `GET /User/Conversations` |
| `/messages/:conversationId` | user | Chat: header, messages with older pages, composer, read marks (mobile 84:530) | `GET /User/Conversations/{id}`, `GET …/messages`, `POST …/messages`, `POST …/read` |
| `/my-reports` | user | The user's reports (10 per page, `?page=`): status, reason, date, details, «رد الإدارة»; «بلاغاتي» in the account menu, sidebar and mobile dashboard | `GET /User/Reports/mine` |
| `/admin` | admin | Dashboard (Figma 80:472): stat cards, the queue preview, the last seven days | `GET /Admin/Stats`, `GET /Admin/Properties/pending?pageSize=3` |
| `/admin/users` | admin | Users (Figma 82:827): status tabs, search, 20 per page | `GET /Admin/Users` |
| `/admin/users/:userId` | admin | One user: profile, counts, ban / unban | `GET /Admin/Users/{id}` + actions |
| `/admin/properties` | admin | Pending queue | `GET /Admin/Properties/pending` |
| `/admin/properties/:id` | admin | Review page, document link, approve, reject | `GET /Admin/Properties/{id}` + actions |
| `/admin/reports` | admin | Reports (Figma 82:1026): status tabs (`?status=`, `?page=`), 10 per page | `GET /Admin/Reports` |
| `/admin/reports/:reportId` | admin | Report review: report, reporter, property card, dismiss / resolve / resolve and suspend | `GET /Admin/Reports/{id}` + actions |
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
  | `Property` (`LIST`, `id`) | search, details | approve, reject, every seller mutation on that id, delete, review create / update / delete |
  | `MyProperties` | `/mine` | create, every seller mutation, delete |
  | `MyProperty` (`id`) | `/mine/{id}` | every seller mutation on that id |
  | `Favorites` | favorites list | add, remove |
  | `FavoriteIds` | `/ids` | add, remove — patched optimistically; invalidated only after the `409` / `404` "already" answers |
  | `PendingProperties` | admin queue | approve, reject |
  | `ReviewProperty` (`id`) | admin review | approve, reject |
  | `Notifications` | notifications list | mark read, mark all read — patched optimistically |
  | `UnreadCount` | `/unread-count` | mark read, mark all read — patched optimistically |
  | `MyProfile` | `GET /me` | none — `PUT /me`, the photo and the password patch the cache with the answer |
  | `SellerProfile` (`id`) | seller page | profile update, photo upload / delete, review create / update / delete |
  | `SellerReviews` (`sellerId`) | the seller's reviews | review create / update / delete |
  | `MyReviewStatus` (`sellerId`) | `/User/Reviews/sellers/{id}/mine` | review create / update / delete (also after a `409` or `404`) |
  | `MyReports` | `/User/Reports/mine` | report a listing |
  | `Conversations` | conversations list | start, send, read, every `messageReceived`, reconnect |
  | `Conversation` (`id`) | details and the messages (infinite query) of one chat | reconnect only — new messages are added to the cache |
  | `UnreadMessages` | `/User/Conversations/unread-count` | start, read, reconnect — `messageReceived` patches it |
  | `AdminReports` | admin reports list | dismiss, resolve |
  | `AdminReport` (`id`) | admin report review | dismiss, resolve (suspending also invalidates `Property`, `ReviewProperty` and `PendingProperties`) |
  | `AdminStats` | admin dashboard | approve, reject, report decisions, ban, unban (and refetched on every visit) |
  | `AdminUsers` | admin users list | ban, unban |
  | `AdminUser` (`id`) | admin user page | ban, unban |

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
| 3 | Error code on non-validation ProblemDetails | done — top-level `code` on 401/403/404/409 (6.2) |
| 4 | Current user endpoint | done — `GET /me` (6.12) |
| 5 | Arabic messages for account endpoints | done |
| 6 | Register ignores `bio` and `profileImageUrl` | done — `PUT /me` and the photo endpoints (6.12) |
| 7 | Richer search results | partly done — `mainImageUrl` added; `createdAtUtc` and `latitude`/`longitude` missing (the map page fetches details meanwhile) |
| 8 | Owner details endpoint | done — `GET /User/Properties/mine/{id}` |
| 9 | Currency | open |
| 10 | CORS for deployment | partly done — only `http://localhost:5173` is allowed |
| 11 | Image and document upload | done — section 6.7 |
| 12 | Section 6.14 features | partly done — notifications, profile, seller page, reports, conversations, real time, reviews, admin users and the dashboard done; see 6.14 for the rest |
| 13 | Register without a user name | done — the email is the login |
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
8. **Profile and seller page** (done) — register without a user name, `GET /me` in the header, `/profile` (data, photo, password), `/sellers/:id`, seller box link.
9. **Reports** (done) — «إبلاغ» on the details page + dialog, `/my-reports`, admin `/admin/reports` + review with dismiss / resolve / suspend, the two new notification types.
10. **Conversations and real time** (done) — «تواصل مع البائع», `/messages` + chat with older pages and read marks, the SignalR hub (messages, read marks, notifications), polling only while disconnected.
11. **Seller reviews** (done) — shared stars, the rating in the details seller box and the seller header, the «التقييمات» tab with my review (create, edit, delete) and the list, the `NewReview` notification.
12. **Admin users and dashboard** (done) — `/admin` stats, `/admin/users` + the user page with ban / unban, the global `429` toast, banned sessions ended (refresh `403`, the hub's `AccountBanned`).
13. **The rest** — as backend endpoints land (section 6.14 and `BACKEND_REQUESTS.md`).

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
