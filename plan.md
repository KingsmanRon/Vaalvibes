# Vaal Vibes PWA — plan.md

## 1) Objectives
- Deliver a branded **Vaal Vibes** web experience (**exact black/white/gold**) with both **Customer Web App** + **Admin Console**.
- Core business flows (**delivered and previously verified**):
  - Publish **menu / events / specials** (public).
  - Capture **customer signups + login**.
  - **Issue + display promo codes** in a customer wallet.
  - Capture **reservation / order-intent requests** (**pay-at-venue / no online payment**).
  - Provide an **admin console** to manage content/promos/campaigns and **validate/redeem** promo codes.
- Keep integrations minimal and explicit:
  - **NO online payments / NO POS integration**.
  - Any not-yet-live functionality must be clearly labeled **MOCKED** in UI:
    - Campaign dispatch
    - Customer QR promo display
    - Image uploads
    - Forgot password
- Browser-first UX requirement (**delivered**):
  - Keep technical PWA support (manifest + service worker) for offline shell/caching.
  - Remove **all** installation prompting behavior/UI (no install CTA, no `beforeinstallprompt` handling).
- Growth + content enhancements (**delivered**):
  - Correct imagery mapping for:
    - Hungry Platter Special → `vv-hungry-platter.jpg`
    - Bottle & Booth Night → `vv-bottle-booth.jpg`
    - Friday After Dark → `vv-friday-after-dark.jpg`
  - **Birthday bookings** intake:
    - Home page section + CTA
    - Dedicated **/birthdays** page with a public booking form
    - Backend ingestion via **/api/public/birthday-requests** and visibility in admin requests.

**Current status update**
- **Phase 1 (Backend) — COMPLETED and smoke-tested**.
- **Phase 2 (Frontend customer + admin) — COMPLETED**.
- **Phase 3 (Verification / bug fixing / PWA checks) — COMPLETED**.
  - Testing Agent **iteration_2**: **backend 100%**, **frontend 100%**.
- **Phase 4 (Browser-first UI revision) — COMPLETED**.
  - Testing Agent **iteration_3**: **frontend 100%** (no regressions).
- **Phase 5 (Imagery mapping + Birthday bookings) — COMPLETED**.
  - Testing Agent **iteration_5**: **backend 100%**, **frontend 100%**.
- **Phase 6 (IN PROGRESS): Production runtime stabilization**
  - User reports runtime error: **`SyntaxError: Unexpected token '<'`**.
  - Treat as an active defect likely caused by the frontend parsing an **HTML error page** (often a 404/500 or wrong base URL) when expecting JSON.

---

## 2) Implementation Steps

### Phase 1 (COMPLETED): Full MVP foundation (backend)
**User stories**
1. As a guest, I can fetch the latest menu/events/specials so I can decide to visit.
2. As a customer, I can register/login and see my promo wallet.
3. As a customer, I can send a reservation/order request and get a reference ID.
4. As an admin, I can log in separately and manage events/specials content.
5. As staff, I can validate and redeem a promo code against a bill amount and get a clear APPROVED/REJECTED reason.

**Delivered**
- Seeded menu/events/specials/campaigns/promo pool + demo users.
- Customer + admin auth (admin uses demo MFA code `246810`).
- Promo validation/redeem logic with BR-1 enforcement.
- Request creation/list endpoints.
- Hardening:
  - Startup promo signature repair for legacy promos.
  - Ensure demo customer has at least one active promo.
- Added **public birthday request ingestion** endpoint: **POST `/api/public/birthday-requests`**.


### Phase 2 (COMPLETED): Frontend experience (customer + admin)
**Delivered**
- Dark-first Vaal Vibes design tokens + fonts.
- Customer bottom-nav shell; admin shell with rail/sheet.
- Pages: Home, Menu, Events, Login/Register, Wallet, Profile, Admin dashboards/CRUD.
- Toast + skeleton + empty states.


### Phase 3 (COMPLETED): Verification, bug fixing, PWA checks
**Delivered / Verified**
- End-to-end flow verified (customer and admin).
- PWA technical assets present.


### Phase 4 (COMPLETED): Browser-first UI revision
**Delivered**
- Removed install prompt UI and `beforeinstallprompt` handling.
- Removed/hidden “Made with Emergent”.
- Hero redesigned to black layout using `vv-hero-shot.jpg`; removed large hero headline.
- Reused additional venue imagery and strengthened logo placement.


### Phase 5 (COMPLETED): Imagery mapping + Birthday bookings
**Delivered**
- Deterministic image mapping for key specials/events.
- Home birthday section + CTA and dedicated `/birthdays` page.
- Birthday form fields + submission (reference ID) and admin visibility.
- Added `data-testid` for birthday seating selector directly on SelectTrigger.


### Phase 6 (IN PROGRESS): Production runtime stabilization (Unexpected token '<')
**Goal**
Eliminate the runtime error and restore stable browsing on the deployed preview.

**Hypothesis**
`Unexpected token '<'` almost always means the frontend tried to parse JSON but received HTML (often an error page or SPA index.html).

**Steps**
1. **Reproduce + capture evidence**
   - Reproduce in preview URL and note route(s) causing it.
   - Capture browser console stack trace and network tab evidence.
2. **Verify backend URL configuration**
   - Confirm `REACT_APP_BACKEND_URL` is correctly set for the deployed environment.
   - Ensure frontend requests go to `/api/...` on the correct host (or correct proxy).
3. **Check failing network requests**
   - Identify the exact request returning HTML (content-type `text/html`).
   - Common culprits:
     - wrong backend base URL -> returning the frontend index.html
     - 404 from backend -> returning a default HTML response
     - CORS/redirect leading to HTML
4. **Fix**
   - If base URL misconfigured: set correct env var / fallback.
   - If endpoint path mismatch: update client routes.
   - Add defensive parsing + error messaging:
     - If response content-type is HTML, show a toast “Service unavailable” and use cached bootstrap.
5. **Regression tests**
   - Smoke test: home bootstrap, menu/events load, birthdays page loads, birthday submission works, admin login works.
   - Re-run testing agent once the runtime error is confirmed resolved.

---

## 3) Next Actions (immediate)
1. Reproduce the `Unexpected token '<'` error and identify the failing network request.
2. Fix backend base URL / routing so frontend receives JSON (not HTML).
3. Add client-side defensive handling for HTML responses (clear user error + fallback to cache).
4. Re-run end-to-end checks:
   - Public browse → birthdays form → admin requests view
   - Customer login → wallet promo
5. Update plan status: Phase 6 complete once preview is stable and testing passes.

---

## 4) Success Criteria
- Brand/UI:
  - Exact Vaal Vibes black/white/gold feel; gold used as accent.
  - No centered-layout anti-pattern; premium spacing and readable hierarchy.
  - No prohibited gradients; no `transition: all`.
- Browser-first behavior:
  - **No install prompt**, no install CTA, no install-related nags.
  - PWA technical assets remain for offline/caching support.
- Visual updates:
  - Correct image mapping for specials/events.
- Birthday bookings:
  - Home CTA + `/birthdays` form works.
  - Submission returns reference ID and appears in admin requests.
- Runtime stability:
  - **No uncaught runtime errors** in console.
  - All key API calls return JSON successfully.
- Testability:
  - `data-testid` coverage retained.
  - Post-fix test run passes (target: 100% backend + frontend).