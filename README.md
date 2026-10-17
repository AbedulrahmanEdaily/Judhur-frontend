# Judhur (جذور) — Frontend

Palestinian real estate marketplace. React + Vite (JavaScript), Tailwind CSS v4, Arabic RTL.
Project conventions and the API contract live in [`CLAUDE.md`](./CLAUDE.md); open backend gaps in [`BACKEND_REQUESTS.md`](./BACKEND_REQUESTS.md).

## Setup

```bash
npm install
cp .env.example .env.development.local   # fill in VITE_HERE_API_KEY (never committed)
npm run dev                              # http://localhost:5173
```

The tracked `.env.development` keeps `VITE_HERE_API_KEY` empty on purpose. Put the key in `.env.development.local` (git-ignored); without it every map shows its fallback card.

The backend must run at `https://localhost:7000`. In development, `/api/*` is proxied there by Vite (see `vite.config.js`), so no CORS setup is needed.

## Scripts

| Script                            | What it does                     |
| --------------------------------- | -------------------------------- |
| `npm run dev`                     | Dev server with the `/api` proxy |
| `npm run build`                   | Production build into `dist/`    |
| `npm run preview`                 | Serve the production build       |
| `npm run lint`                    | ESLint                           |
| `npm run format` / `format:check` | Prettier                         |

## Production

### Environment

Set these in the build environment (CI variables), not in a committed file:

| Variable                | Value                                                                       |
| ----------------------- | --------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`     | The backend origin, e.g. `https://api.example.com` (empty = same origin)    |
| `VITE_HERE_API_KEY`     | A production HERE key, separate from the development key                    |
| `VITE_GOOGLE_CLIENT_ID` | Already in `.env.production`; override only for another Google OAuth client |

- Restrict each HERE key to its own origins in the HERE platform (the development key to `http://localhost:5173`, the production key to the deployed origin).
- Add `<origin>/auth/google` to the Google OAuth client's authorized redirect URIs.
- The backend must allow the deployed origin in CORS (BACKEND_REQUESTS #10) and expose `Retry-After`.

### Web server

`npm run build` writes static files to `dist/`. The server in front of them needs three things:

1. **SPA fallback.** Any path that is not a file returns `index.html` with `200`, so deep links such as `/properties/…` or `/confirm-email?…` work on reload.
2. **Reverse proxy for the API and the hub** when the API is served from the same origin (`VITE_API_BASE_URL` empty). `/api/*` goes to the backend; `/hubs/*` goes to the backend **with the WebSocket upgrade** (`Upgrade` and `Connection` headers passed on, a long read timeout), or SignalR falls back to slower transports.
3. **Cache headers.** Files under `/assets/` have a content hash in their name: `Cache-Control: public, max-age=31536000, immutable`. `index.html` must not be cached: `Cache-Control: no-cache`, so a new deploy is picked up at once.

Example for nginx:

```nginx
server {
  root /var/www/judhur/dist;

  location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  location /api/ {
    proxy_pass https://backend:7000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /hubs/ {
    proxy_pass https://backend:7000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 3600s;
  }

  location / {
    add_header Cache-Control "no-cache";
    try_files $uri /index.html;
  }
}
```
