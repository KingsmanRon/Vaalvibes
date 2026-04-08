# Vaal Vibes PWA — plan.md

## 1) Objectives
- Deliver a branded **Vaal Vibes** web experience (**exact black/white/gold**) with both **Customer PWA** + **Admin Console**.
- Core business flows (MVP, already delivered):
  - Publish **menu / events / specials** (public).
  - Capture **customer signups + login**.
  - **Issue + display promo codes** in a customer wallet.
  - Capture **reservation / order-intent requests** (**pay-at-venue / no online payment**).
  - Provide an **admin console** to manage content/promos/campaigns and **validate/redeem** promo codes.
- Keep integrations minimal and explicit:
  - **NO online payments / NO POS integration**.
  - Any not-yet-live functionality must be clearly labeled **MOCKED** in UI.
    - Campaign dispatch
    - Customer QR promo display
    - Image uploads
    - Forgot password
- Current status update:
  - **Phase 1 (Backend) — COMPLETED and smoke-tested**.
  - **Phase 2 (Frontend customer + admin) — COMPLETED**.
  - **Phase 3 (Verification / bug fixing / PWA checks) — COMPLETED**.
  - Testing Agent **iteration_2**: **backend 100%**, **frontend 100%**.
  - **Post-MVP UI Revision — IN PROGRESS**:
    - Keep technical PWA capability intact, but remove **installation prompts / install UI / install behavior**.
    - Remove **“Made with Emergent”** badge.
    - Redesign hero tile to **black background** using uploaded image **A (DSC_0585.jpg)**; remove the large headline label.
    - Use uploaded images **B (DSC_0592.jpg)** and **C (DSC_0630 (1).jpg)** in other appropriate sections.
    - Improve brand presence by **interchanging / reinforcing logo placement** across the UI.

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
1. As a user, I can install Vaal Vibes on my phone and it feels app-like.
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


### Phase 4 (IN PROGRESS): Post-MVP UI revision (browser-first UX)
**Goal**
- Keep the underlying PWA technical pieces (manifest/service worker) but remove **all install-request behavior/UI**.
- Remove Emergent branding badge.
- Refresh hero and imagery using new uploaded photos.

**Work items**
1. **Remove install prompt and installation behaviors (keep technical PWA files)**
   - Remove the in-app “Install Vaal Vibes” prompt UI.
   - Remove the `beforeinstallprompt` listener + related localStorage visit-count tracking.
   - Keep `manifest.json` and `sw.js` in place (browser-only UX, no install nagging).

2. **Remove “Made with Emergent” badge**
   - Remove (or hide) the fixed Emergent badge element in `public/index.html`.

3. **Hero tile redesign (Home page)**
   - Replace current hero background with uploaded image **A: DSC_0585.jpg**.
   - Make hero section **black background** with the photo used as the visual element.
   - Remove the large hero label text: **“Nightlife energy. Gold-standard hospitality.”**
   - Preserve quick CTAs (Menu / Reserve / Events) and premium vibe styling.

4. **Use new photography elsewhere**
   - Add uploaded image **B: DSC_0592.jpg** in a suitable section:
     - Suggestion: Specials section header image or a featured “Bottle service” card.
   - Add uploaded image **C: DSC_0630 (1).jpg** in a suitable section:
     - Suggestion: Events section card imagery or “Hours & Location / Venue experience” card.
   - Ensure images are optimized for performance and cropped consistently.

5. **Interchange / strengthen logo placement**
   - Use uploaded `Logo.png` in more than one location (e.g., home hero corner watermark, admin sidebar header, login cards).
   - Keep logo usage subtle and premium (no clutter).

6. **Regression testing**
   - Re-run customer and admin flows after UI changes.
   - Verify no console errors; ensure caching/offline behavior unaffected.

---

## 3) Next Actions (immediate)
1. Remove install prompt UI + all install-trigger logic, leaving manifest/service worker intact.
2. Remove “Made with Emergent” badge from `public/index.html`.
3. Update Home hero tile:
   - Use `DSC_0585.jpg` and remove the large headline label.
4. Place `DSC_0592.jpg` and `DSC_0630 (1).jpg` in appropriate sections (specials/events/admin header as applicable).
5. Adjust logo placement for stronger brand presence.
6. Re-run testing agent to confirm 100% pass remains.

---

## 4) Success Criteria
- Brand/UI:
  - Exact Vaal Vibes black/white/gold feel; gold used as accent.
  - No centered-layout anti-pattern; premium spacing and readable hierarchy.
  - No prohibited gradients; no `transition: all`.
- Browser-first behavior:
  - **No install prompt**, no install CTA, no install-related nags.
  - PWA technical assets may remain, but **installation requests are removed**.
- Visual updates:
  - Hero tile uses **DSC_0585.jpg** with black background treatment.
  - Uploaded images **B** and **C** are used elsewhere appropriately.
  - “Made with Emergent” badge removed.
  - Logo presence enhanced tastefully.
- Core flows still work end-to-end:
  - Customer: register/login, wallet promo display, request submission.
  - Admin: login (demo OTP), CRUD, promo validate/redeem.
- Testability:
  - `data-testid` coverage retained for primary actions.
  - Clean end-to-end test run after Phase 4 changes.