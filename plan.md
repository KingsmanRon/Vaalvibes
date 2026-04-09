# Vaal Vibes PWA — plan.md

## 1) Objectives
- Deliver a branded **Vaal Vibes** web experience (**exact black/white/gold**) with both **Customer Web App** + **Admin Console**.
- Core business flows (**delivered and verified**):
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
  - Keep technical PWA files in the project (`manifest.json`, `sw.js`).
  - **No install prompting** and **no install CTA**.
  - Runtime stability hardening: prevent stale SW/cache issues from breaking JS delivery.
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
- **Phase 6 (Runtime stabilization) — COMPLETED**.
  - Root cause of **`SyntaxError: Unexpected token '<'`** was stale service worker/browser cache behavior causing HTML to be served where JavaScript was expected.
  - Verified: **no Unexpected token error**, **service worker registrations = 0**, console clean aside from unrelated `cdn-cgi/rum` abort.

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
  - Ensure demo customer has at least one active promo on startup.
  - Ensure demo customer login re-issues an active promo if missing.
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
- Technical PWA files present.


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
- Birthday form stability updates:
  - Field component preserves explicit child `data-testid`.
  - Birthday celebration date uses **native date input** for stability.


### Phase 6 (COMPLETED): Production runtime stabilization (Unexpected token '<')
**Goal**
Eliminate the runtime error and restore stable browsing on the deployed preview.

**Root cause**
Stale service worker/browser cache behavior could cause HTML to be served where JavaScript was expected, triggering:
- `SyntaxError: Unexpected token '<'`

**Fix delivered**
- Disabled active service worker registration in `src/index.js`.
- Added early cleanup/unregister logic in both:
  - `public/index.html`
  - `src/index.js`
  to clear existing Vaal Vibes service workers and `vaal-vibes-shell*` caches.
- Preserved technical PWA files in the project (`manifest.json`, `sw.js`) while removing install prompts.

**Additional stabilization improvements delivered**
- Admin charts: replaced `ResponsiveContainer`-based charts with fixed-dimension charts to eliminate width/height warnings.

**Verification**
- Confirmed no `Unexpected token '<'` runtime errors.
- Confirmed service worker registrations remain at **0**.
- Confirmed core flows still work.

---

## 3) Next Actions (immediate)
1. (Optional) Re-enable service worker caching later with a safer versioned strategy (and explicit cache invalidation), if offline-first behavior becomes a priority again.
2. (Optional) Add spam prevention for the public birthday form:
   - honeypot field
   - basic rate limiting
3. (Optional) Admin enhancements:
   - filter requests by `request_type` (including `birthday-booking`)
   - add a KPI tile for birthday bookings

---

## 4) Success Criteria
- Brand/UI:
  - Exact Vaal Vibes black/white/gold feel; gold used as accent.
  - No centered-layout anti-pattern; premium spacing and readable hierarchy.
  - No prohibited gradients; no `transition: all`.
- Browser-first behavior:
  - **No install prompt**, no install CTA, no install-related nags.
  - Technical PWA files remain in project.
  - Service worker/caches do **not** break runtime delivery.
- Visual updates:
  - Correct image mapping for specials/events.
- Birthday bookings:
  - Home CTA + `/birthdays` form works.
  - Submission returns reference ID and appears in admin requests.
- Runtime stability:
  - **No uncaught runtime errors** in console.
  - Service worker registrations remain **0**.
  - All key API calls return JSON successfully.
- Testability:
  - `data-testid` coverage retained.
  - Stable automated targeting for birthday inputs.
  - Post-fix test run passes (target: 100% backend + frontend).