# Vaal Vibes PWA — plan.md

## 1) Objectives
- Deliver a branded, installable **Vaal Vibes** PWA (**exact black/white/gold**) + **Admin Console** in one MVP.
- Core business flows:
  - Publish **menu / events / specials** (public).
  - Capture **customer signups + login**.
  - **Issue + display promo codes** in a customer wallet.
  - Capture **reservation / order-intent requests** (**pay-at-venue / no online payment**).
  - Provide an **admin console** to manage content/promos/campaigns and **validate/redeem** promo codes.
- Keep MVP integrations minimal and explicit:
  - **NO online payments / NO POS integration**.
  - Any not-yet-live functionality must be clearly labeled **MOCKED** in UI (e.g., campaign dispatch, QR promo display, image uploads).
- Current status update:
  - **Backend foundation is complete and smoke-tested**.
  - **Phase 2 frontend experience is implemented end-to-end** (customer + admin).
  - Focus shifts to **Phase 3 (verification, bug fixing, final polish)**.

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
  - Backend startup now runs **promo signature repair** for any legacy/seeded promo codes (prevents false signature failures).
- Smoke testing completed:
  - Registration → wallet retrieval → request creation → admin login → promo validate → promo redeem (success).


### Phase 2 (COMPLETED): Frontend experience (customer + admin)
**User stories**
1. As a guest, I can browse a premium landing page and quickly jump to menu/events/specials.
2. As a customer, I can sign up/login and immediately see a welcome promo in my wallet.
3. As a customer, I can build a reservation/order intent (no payment) and submit it in under a minute.
4. As an admin, I can create/edit events and specials from my phone using drawers/sheets.
5. As staff, I can validate and redeem a promo in seconds with a big input and clear result card.

**Delivered**
- Global brand tokens + layout rules (non-negotiables):
  - Dark-first theme tokens in `index.css` aligned with palette: **#111111 / #1A1A1A / #F5C518 / #FFFFFF / #B5B5B5**.
  - Fonts loaded: **Bebas Neue** (display) + **Space Grotesk** (body/UI).
  - Removed CRA-centered layout styles; no global centering.
  - Gradients restricted and decorative only (<=20% viewport) + noise overlay utilities.
- App routing + shells:
  - Customer shell with **bottom nav** (Home/Menu/Events/Wallet/Profile).
  - Admin shell with **left rail** on desktop + **Sheet drawer** on mobile + top bar.
  - Token storage + guarded routes for customer/admin.
- Data layer + UX states:
  - Axios API wrapper for backend calls.
  - Bootstrap fetch (`/public/bootstrap`) + local cache fallback.
  - Toast feedback (sonner), skeleton loading panels, and empty states.
- Customer pages (mobile-first):
  - Home (hero + quick CTAs + specials/events blocks + hours).
  - Menu (tabs + accordion; add item → request drawer; **no payment** copy).
  - Events (filters; request booking CTA).
  - Auth (register/login), Wallet, Profile/Preferences, My Requests.
  - Reservation/Order request multi-step drawer flow with progress + reference ID confirmation.
- Admin pages:
  - Admin login (email + password + OTP) with demo OTP helper text.
  - Dashboard KPIs + charts + recent requests.
  - Events CRUD (Sheet editor with Calendar).
  - Specials CRUD (grid/table toggle + Sheet editor).
  - Promo Pools create + listing.
  - Promo Validate/Redeem screen (big inputs, result card, confirmation dialog).
  - Users list + Audit logs viewer.
  - Campaigns list + composer + **dispatch clearly labeled MOCKED**.
- PWA/UI utilities:
  - Install prompt UI (shown after 2nd visit when supported).
  - Offline banner + cached bootstrap fallback.
  - Manifest + icons + service worker registration.
- Post-test fixes:
  - Customer auth form `data-testid` now attaches to actual controls (inputs/selects) rather than wrappers.
  - Menu accordions default-open so menu items are visible without requiring an initial click.


### Phase 3 (In Progress): Verification, bug fixing, final polish
**User stories**
1. As a user, I can install Vaal Vibes on my phone and it feels app-like.
2. As a user, I can see an offline banner and still browse last-known content.
3. As a customer, I can recover from network errors without losing my request form.
4. As an admin, I can navigate dashboards quickly on mobile with no layout break.
5. As staff, I can trust promo validation results are consistent and logged.

**Steps**
- Verification (end-to-end):
  - Run a full flow:
    - Public browse → customer register/login → wallet → request submit → admin login → CRUD event/special → validate + redeem promo.
  - Confirm BR-1 enforcement behavior from UI.
  - Confirm audit logs reflect admin actions and promo validation/redemption.
- PWA readiness checks:
  - Confirm manifest fields, icons, theme/background colors.
  - Confirm service worker cache behavior and offline fallback are stable.
  - Confirm install prompt logic (2nd visit) behaves safely across browsers.
- UX polish:
  - Ensure all interactive elements have `data-testid` in kebab-case.
  - Confirm spacing, contrast, and focus rings meet accessibility guidelines.
  - Confirm “MOCKED” labels are present wherever required (campaign dispatch, QR promo display, image uploads, forgot password).
- Bug fixing:
  - Address any runtime console errors, broken routes, and edge-case API failures.
  - Harden error handling for offline/timeout scenarios.

---

## 3) Next Actions (immediate)
1. Re-run testing agent across customer + admin flows after recent fixes.
2. Validate offline mode behaviors:
   - cached bootstrap usage
   - offline banner
   - request submit failure messaging when offline
3. Validate PWA installability:
   - manifest correctness
   - icons load
   - service worker cache updates
4. UI/UX QA pass:
   - confirm `data-testid` coverage
   - check responsiveness (mobile → desktop)
   - confirm no prohibited gradients and no `transition: all`
5. Resolve any remaining defects and update plan/todos accordingly.

---

## 4) Success Criteria
- Brand/UI:
  - Exact Vaal Vibes black/white/gold feel; gold used as accent.
  - No centered-layout anti-pattern; premium spacing and readable hierarchy.
  - No prohibited gradients; no `transition: all`.
- Core flows work end-to-end (from UI to backend):
  - Customer can register/login, see wallet promo, submit reservation/order-intent request.
  - Admin can log in with OTP (demo code), manage events/specials, validate + redeem promo with correct **BR-1** behavior.
- Reliability & auditability:
  - Errors handled with clear messages and toasts.
  - Promo validation/redemption and admin CRUD actions generate audit logs.
  - Promo signature validation remains stable (including legacy seeded promos via repair on startup).
- PWA:
  - Installable, offline banner visible, last-known content viewable when offline.
- Testability:
  - `data-testid` coverage for primary actions.
  - One clean end-to-end testing run with no critical failures.
