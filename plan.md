# Vaal Vibes PWA — plan.md

## 1) Objectives
- Deliver a branded **Vaal Vibes** web experience (**exact black/white/gold**) with both **Customer PWA** + **Admin Console**.
- Core business flows (MVP, delivered):
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
- Browser-first UX requirement (delivered):
  - Keep technical PWA support (manifest + service worker) for offline shell/caching.
  - Remove **all** installation prompting behavior/UI (no install CTA, no beforeinstallprompt handling).
- Current status update:
  - **Phase 1 (Backend) — COMPLETED and smoke-tested**.
  - **Phase 2 (Frontend customer + admin) — COMPLETED**.
  - **Phase 3 (Verification / bug fixing / PWA checks) — COMPLETED**.
  - Testing Agent **iteration_2**: **backend 100%**, **frontend 100%**.
  - **Phase 4 (Post-MVP browser-first UI revision) — COMPLETED**.
  - Testing Agent **iteration_3**: **frontend 100%** (no regressions).

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
- Data + seed content:
  - Seeded **menu, events, specials, campaigns, promo pool**, demo **admins + customer**.
- Auth:
  - Customer register/login with **welcome promo issuance**.
  - Separate admin auth with **role-based access** and **demo MFA code (246810)** for MVP.
- Customer APIs:
  - Wallet, profile, request creation/list.
- Admin APIs:
  - Dashboard metrics.
  - Events/Specials/Campaigns/Promo Pools CRUD.
  - Users + audit logs.
  - Promo validate/redeem/revoke.
- Promo engine + rules:
  - HMAC signature validation + expiry/status.
  - **BR-1** enforced: **20% discount only if bill > R1500**.
  - Atomic redemption + redemption logging + audit logging.
- Hardening / fixes:
  - Backend startup runs **promo signature repair** for any legacy/seeded promo codes.
- Smoke testing completed:
  - Registration → wallet retrieval → request creation → admin login → promo validate → promo redeem.


### Phase 2 (COMPLETED): Frontend experience (customer + admin)
**User stories**
1. As a guest, I can browse a premium landing page and quickly jump to menu/events/specials.
2. As a customer, I can sign up/login and immediately see a welcome promo in my wallet.
3. As a customer, I can build a reservation/order intent (no payment) and submit it quickly.
4. As an admin, I can create/edit events and specials from mobile using drawers/sheets.
5. As staff, I can validate and redeem a promo quickly with a clear result card.

**Delivered**
- Global brand tokens + layout rules:
  - Dark-first theme tokens in `index.css` aligned with palette: **#111111 / #1A1A1A / #F5C518 / #FFFFFF / #B5B5B5**.
  - Fonts loaded: **Bebas Neue** (display) + **Space Grotesk** (body/UI).
  - Removed CRA-centered layout styles.
  - Decorative gradients limited + noise overlay utilities.
- App routing + shells:
  - Customer shell with **bottom nav**.
  - Admin shell with **left rail** (desktop) + **Sheet drawer** (mobile).
- Data layer + UX states:
  - Bootstrap fetch + cached fallback.
  - Toast feedback, skeleton loading panels, empty states.
- Customer pages:
  - Home, Menu, Events, Auth, Wallet, Profile/Preferences, Requests, Request builder drawer.
- Admin pages:
  - Login (with OTP), Dashboard, Events CRUD, Specials CRUD, Promo desk, Promo pools, Users, Audit logs, Campaigns.
- PWA technical shell:
  - Manifest/icons present.
  - Service worker registered.
  - Offline banner + cached bootstrap fallback.


### Phase 3 (COMPLETED): Verification, bug fixing, final polish
**User stories**
1. As a user, I can use the app reliably across mobile/desktop.
2. As a user, I can see an offline banner and still browse last-known content.
3. As a customer, I can recover from network errors without losing my request form.
4. As an admin, I can navigate dashboards quickly on mobile.
5. As staff, I can trust promo validation results are consistent and logged.

**Delivered / Verified**
- End-to-end verification completed.
- BR-1 enforced and verified.
- Audit logs verified.
- PWA assets and service worker validated.
- Testing Agent **iteration_2**: **backend 100%**, **frontend 100%**.


### Phase 4 (COMPLETED): Post-MVP browser-first UI revision
**Goal**
- Keep the underlying PWA technical pieces (manifest/service worker) but remove **all install-request behavior/UI**.
- Remove Emergent branding badge.
- Refresh hero and imagery using newly uploaded photos.

**Delivered**
1. **Removed install prompt and installation behaviors (kept technical PWA files)**
   - Removed in-app “Install Vaal Vibes” prompt UI.
   - Removed the `beforeinstallprompt` listener + visit-count tracking.
   - Kept `manifest.json` and `sw.js` in place.

2. **Removed “Made with Emergent”**
   - Removed the badge markup from `public/index.html`.
   - Added defensive CSS to hide any injected `#emergent-badge`.

3. **Hero tile redesign (Home page)**
   - Rebuilt hero to a **black** layout.
   - Uses uploaded image **A** (`vv-hero-shot.jpg`) as the hero feature image.
   - Removed the large hero headline label (previously “Nightlife energy. Gold-standard hospitality.”).

4. **Used new photography elsewhere**
   - Uploaded image **B** (`vv-bottle-shot.jpg`) used in the **Specials** section.
   - Uploaded image **C** (`vv-bar-shot.jpg`) used in **Hours & Location / Venue** section.

5. **Reinforced logo placement**
   - Adopted the full uploaded logo (`vv-logo-full.png`) in hero + brand badge areas for stronger presence.

6. **Regression testing**
   - Testing Agent **iteration_3**: **frontend 100%**; confirms:
     - No install prompts
     - Emergent badge removed/hidden
     - Updated hero + images present
     - Core navigation and customer flows still functional

---

## 3) Next Actions (immediate)
1. Handoff-ready documentation:
   - Confirm demo credentials and MFA code are shared with stakeholders.
   - List MOCKED features explicitly (campaign dispatch, QR promo display, image uploads, forgot password).
2. Optional enhancements (post-MVP):
   - Replace demo MFA with real TOTP.
   - Add real email dispatch (SES) + unsubscribe flows.
   - Add real image uploads (R2/S3) with resizing.
   - Expand and normalize menu catalog ingestion (full PDF coverage) + search.
3. Operational hardening:
   - Add rate limits + structured logging, if needed.

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
  - Hero tile uses **vv-hero-shot.jpg** with black background treatment.
  - Uploaded images **vv-bottle-shot.jpg** and **vv-bar-shot.jpg** used appropriately.
  - “Made with Emergent” removed/hidden.
  - Logo presence enhanced tastefully.
- Core flows still work end-to-end:
  - Customer: register/login, wallet promo display, request submission.
  - Admin: login (demo OTP), CRUD, promo validate/redeem.
- Testability:
  - `data-testid` coverage retained for primary actions.
  - Verified test runs:
    - iteration_2: backend 100% + frontend 100%
    - iteration_3: frontend 100% after browser-first UI revision
