# Judhur (جذور) — Frontend

Palestinian real estate marketplace. React + Vite (JavaScript), Tailwind CSS v4, Arabic RTL.
Project conventions and the API contract live in [`CLAUDE.md`](./CLAUDE.md); open backend gaps in [`BACKEND_REQUESTS.md`](./BACKEND_REQUESTS.md).

## Setup

```bash
npm install
cp .env.example .env.local   # fill in VITE_GOOGLE_MAPS_API_KEY
npm run dev                  # http://localhost:5173
```

The backend must run at `https://localhost:7000`. In development, `/api/*` is proxied there by Vite (see `vite.config.js`), so no CORS setup is needed.

## Scripts

| Script                            | What it does                     |
| --------------------------------- | -------------------------------- |
| `npm run dev`                     | Dev server with the `/api` proxy |
| `npm run build`                   | Production build into `dist/`    |
| `npm run preview`                 | Serve the production build       |
| `npm run lint`                    | ESLint                           |
| `npm run format` / `format:check` | Prettier                         |
