# Vaal Vibes

Vaal Vibes is the operations platform for the Vaal Vibes nightlife venue at 16 Fraser Street, Vanderbijlpark, Gauteng (South Africa). The product combines a public-facing marketing site, a customer account area (login, promos, reservations, birthday bookings, gallery), and an admin console used by the venue team to manage events, specials, the menu, gallery, promotional codes, email campaigns, users, and audit history.

The repo contains a single FastAPI service plus a single Create React App SPA, both intentionally kept as one-file code units so the venue team can iterate quickly with a small toolchain.

---

## Architecture

```
                       +------------------+
                       |   Browser (SPA)  |
                       |  React 18 + CRA  |
                       |  Tailwind + UI   |
                       +---------+--------+
                                 |
                  Formspree <----+----> REACT_APP_BACKEND_URL/api
                  (form posts)  |
                                v
                       +------------------+
                       |  FastAPI server  |
                       |   backend/       |
                       |   server.py      |
                       +----+--------+----+
                            |        |
                  Resend <--+        +--> MongoDB Atlas
              (campaigns,                 (collections below)
               optional)
                                          Google Drive
                                          (gallery image hosting,
                                           public-link folder)
```

- Frontend deploys to Vercel from `main`.
- Backend deploys to Railway from `main`.
- MongoDB is hosted (Atlas).
- External services: Formspree (form forwarding), Resend (transactional/campaign sending), Google Drive (gallery photo hosting via shared folder + file IDs).

---

## Repo layout

```
/
|-- backend/
|   |-- server.py           # entire FastAPI app (~1500 lines, single file)
|   |-- requirements.txt
|   `-- .env.example
|-- frontend/
|   |-- src/
|   |   |-- App.js          # entire SPA (~3000 lines, single file)
|   |   |-- App.css
|   |   |-- index.js
|   |   |-- components/ui/  # shadcn/ui primitives
|   |   |-- hooks/
|   |   `-- lib/
|   |-- package.json
|   |-- public/             # static assets (logos, posters, photos)
|   `-- .env.example
`-- README.md
```

| Path | Purpose |
|------|---------|
| `backend/server.py` | FastAPI app: routes, models, auth, seed, email, promos. |
| `backend/requirements.txt` | Python dependencies for the API. |
| `backend/.env.example` | Template for backend env vars. |
| `frontend/src/App.js` | The full single-page React app (public site, customer area, admin console). |
| `frontend/src/components/ui/` | shadcn/ui primitives. |
| `frontend/src/hooks/`, `frontend/src/lib/` | Reusable hooks and utility helpers. |
| `frontend/public/` | Static images (logos, posters, photos) served as-is. |
| `frontend/.env.example` | Template for frontend env vars. |

---

## Local development

The frontend uses [`craco`](https://github.com/dilanx/craco) on top of Create React App and ships without a lockfile in this branch. The team uses `yarn`, but `npm install` works equivalently if you prefer.

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# edit .env with your MONGO_URL, secrets, etc.
uvicorn server:app --reload --port 8000
```

The API is then reachable at `http://localhost:8000/api/...`.

### Frontend

```bash
cd frontend
yarn install
cp .env.example .env
# set REACT_APP_BACKEND_URL=http://localhost:8000
yarn start
```

The SPA is served at `http://localhost:3000`.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGO_URL` | Yes | MongoDB connection string. | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `DB_NAME` | Yes | Mongo database name. | `vaalvibes` |
| `APP_JWT_SECRET` | Yes | Secret used to sign JWT access tokens. | `change-me-in-prod` |
| `PROMO_SIGNING_SECRET` | Yes | HMAC key used to sign / verify promo codes. | `change-me-in-prod` |
| `CORS_ORIGINS` | Yes | Comma-separated list of allowed frontend origins. | `https://vaalvibes.co.za,http://localhost:3000` |
| `RESEND_API_KEY` | No | If set, campaign dispatch sends real emails via Resend. If unset, dispatch runs in mock-only mode. | `re_xxx` |
| `RESEND_FROM_EMAIL` | No | Verified sender used by Resend. | `hello@vaalvibes.co.za` |

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Yes | Base URL of the FastAPI backend. The SPA appends `/api/...`. | `https://api.vaalvibes.co.za` |
| `REACT_APP_FORMSPREE_ENDPOINT` | Yes | Formspree endpoint that receives reservation, birthday, and gallery-removal submissions. | `https://formspree.io/f/xxxx` |
| `REACT_APP_POSTERS_FOLDER_URL` | Yes | Public Google Drive folder URL backing the gallery (must be set to "Anyone with the link can view"). | `https://drive.google.com/drive/folders/...` |

---

## API surface

The backend listens at `${BACKEND_URL}/api/...` and namespaces routes by audience:

| Prefix | Audience | Auth |
|--------|----------|------|
| `/api/public/*` | Anyone | None |
| `/api/customer/*` | Logged-in customers | `Authorization: Bearer <token>` |
| `/api/admin/*` | Admin users | `Authorization: Bearer <token>` (admin role) |

JWT access tokens expire after 7 days (`ACCESS_TOKEN_MINUTES = 60 * 24 * 7`).

---

## Admin and customer access

### Customers

- Register at `/register` (frontend route).
- Log in at `/login`.
- A welcome promo is auto-issued on registration; codes are HMAC-signed and validated at the Promo Desk.
- Demo customer email: `guest@vaalvibes.app` (no demo customer is seeded in production; the backend instead keeps a maintenance task that ensures this account always has an active welcome promo when present).

### Admin console

- Log in at `/admin/login`.
- The first run of the backend calls `seed_database()` and inserts three default admins (passwords are hashed at seed time):

| Role | Email | Password (seed) |
|------|-------|-----------------|
| `super` | `super@vaalvibes.app` | `VaalVibes!123` |
| `marketing` | `marketing@vaalvibes.app` | `VaalVibes!123` |
| `promo` | `promo@vaalvibes.app` | `VaalVibes!123` |

> Rotate the seed passwords before going live.

#### Admin MFA (TOTP) enrollment

Admin login uses real RFC 6238 TOTP (Google Authenticator, Authy, 1Password, etc.). On the very first login an admin submits email + password and leaves the MFA field blank — the server provisions a TOTP secret and the UI displays a one-time secret + provisioning URI for the admin to scan or paste into their authenticator app. The next code from the app completes login and marks the account as enrolled.

If an admin loses their authenticator, a `super` admin can clear the enrollment via `POST /api/admin/auth/mfa/reset` (`{ "target_admin_id": "..." }`); the next login starts a fresh enrollment.

#### Login rate limiting

Both `POST /api/auth/login` (customer) and `POST /api/admin/auth/login` are throttled per client IP with an in-memory sliding window. Defaults: 8 customer attempts / 5 min, 5 admin attempts / 5 min, 5 customer registrations / 10 min. Successful logins reset the counter so a typo recovery doesn't lock out the user. The buckets are in-process — for multi-instance deployments swap in a Redis-backed limiter.

---

## Deployment

| Layer | Host | Trigger |
|-------|------|---------|
| Frontend | Vercel | Auto-deploys on push to `main`. |
| Backend | Railway | Auto-deploys on push to `main`. |
| Database | MongoDB (Atlas) | Managed externally. |

Configure each environment variable in the relevant platform dashboard:

- Vercel: project settings -> Environment Variables (`REACT_APP_*`).
- Railway: service variables (`MONGO_URL`, `DB_NAME`, secrets, optional `RESEND_*`).
- DNS: point `vaalvibes.co.za` to Vercel for the frontend, and an `api.` subdomain (or similar) to Railway for the backend. Update `CORS_ORIGINS` whenever a new frontend origin is introduced.

---

## Operating the venue (admin sections)

| Section | What it does |
|---------|--------------|
| Dashboard | At-a-glance counts of upcoming events, open requests, active promos, recent campaigns. |
| Events | CRUD for event posters and details surfaced on the public site. |
| Specials | CRUD for nightly specials and time-limited offers. |
| Menu | Full editor for `menu_categories` and embedded `items` (price, description, tags, featured flag). |
| Gallery | Add / remove / reorder gallery photos backed by Google Drive file IDs. |
| Promo Desk | Validate and redeem promo codes presented by customers; each redemption is logged. |
| Campaigns | Compose and dispatch email campaigns through Resend (or mock mode if `RESEND_API_KEY` is unset). |
| Users | View customer accounts and admin users. |
| Audit | Append-only `audit_logs` of admin actions for traceability. |

### Major MongoDB collections

`customers`, `admin_users`, `events`, `specials`, `menu_categories` (with embedded `items`), `gallery_photos`, `requests` (reservations + birthday bookings + order intents), `promo_pools`, `promo_codes`, `redemption_logs`, `campaigns`, `audit_logs`.

---

## Email pipelines

Two complementary channels are wired in:

- **Formspree (frontend -> email).** The SPA posts directly to `REACT_APP_FORMSPREE_ENDPOINT` for:
  - Reservation requests.
  - Birthday booking requests.
  - Gallery photo removal requests.
- **Resend (backend -> email).** The backend uses Resend for:
  - Admin-triggered email campaigns dispatched from the Campaigns section.

If `RESEND_API_KEY` is unset, campaign dispatch runs in mock mode and records the run without sending real email.

### Domain verification for Resend

Before campaigns send real email, the operator must verify the sending domain in the Resend dashboard:

1. Add `vaalvibes.co.za` to Resend.
2. Publish the DKIM and SPF records Resend provides as DNS entries on the domain.
3. Wait for Resend to mark the domain as verified.
4. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` on Railway and redeploy.

Until those steps are done, the dispatch endpoint will continue to run in mock-only mode.

---

## Operating notes / gotchas

- **Seed is structural bootstrap only.** `seed_database()` runs once against an empty DB and inserts only what the app needs to *function*: admin logins, the welcome promo pool, and the canonical menu. Operational content — events, specials, campaigns — is **not seeded**; it lives entirely in MongoDB and is managed via `/admin/*` routes. A redeploy never overwrites or re-creates these.
- **Menu is data-driven.** `/admin/menu` is the canonical place to add or reprice items. Code changes are not required for new prices, items, or categories. To bulk-restore the canonical menu, use `/admin/menu` → "Reset to default prices" (calls `POST /admin/menu/sync-defaults`, which re-inserts the contents of `default_menu_categories()` in `backend/server.py`).
- **Gallery photos use Google Drive file IDs.** The Drive folder pointed at by `REACT_APP_POSTERS_FOLDER_URL` must be set to "Anyone with the link can view" so the SPA can hot-link the images.
- **Campaign dispatch falls back to mock mode** when `RESEND_API_KEY` is unset. Real email only sends once the key is configured and the domain is verified. **Birthday booking confirmation emails** use the same Resend pipeline — they are sent automatically to the requester when `RESEND_API_KEY` is set, and silently skipped (with a log line) when it isn't. Reservation and order-intent flows do not send a customer-facing confirmation; they continue to rely on Formspree forwarding.
- **JWTs are 7-day tokens.** Customers and admins will be logged out roughly weekly; rotate `APP_JWT_SECRET` to force-revoke all sessions.
- **Promo codes are HMAC-signed** with `PROMO_SIGNING_SECRET`. Rotating that secret invalidates every outstanding code.
- **CORS** is driven by `CORS_ORIGINS`; new frontend origins (preview deploys, custom domains) must be added explicitly.

---

## Future work / known limitations

- Automated reservation follow-ups (confirmation + reminder emails). Birthday confirmation emails ship today; reservation and order-intent flows still rely on Formspree only.
- Move the in-memory login rate limiter to Redis once the backend scales beyond a single instance.
- Storage usage / quota dashboard for gallery and Drive contents.
- Audience segmentation for campaigns (currently broadcast-only).
- Split `backend/server.py` and `frontend/src/App.js` into modules once the surface area stabilises.
- Add automated tests around promo signing, JWT auth, and campaign dispatch.
