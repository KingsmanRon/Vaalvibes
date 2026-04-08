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
  - Any not-yet-live functionality must be clearly labeled **MOCKED** in UI.
    - Campaign dispatch
    - Customer QR promo display
    - Image uploads
    - Forgot password
- Current status update:
  - **Phase 1 (Backend) — COMPLETED and smoke-tested**.
  - **Phase 2 (Frontend customer + admin) — COMPLETED**.
  - **Phase 3 (Verification / bug fixing / PWA checks) — COMPLETED**.
  - **MVP is complete and verified** (Testing Agent iteration_2: backend 100%, frontend 100%).

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
  - Backend startup runs **promo signature repair** for any legacy/seeded promo codes (prevents false signature failures).
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
- Post-test fixes (now verified):
  - Customer auth form `data-testid` attaches to actual controls (inputs/selects) rather than wrappers.
  - Menu accordions default-open so menu items are visible without requiring an initial click.


### Phase 3 (COMPLETED): Verification, bug fixing, final polish
**User stories**
1. As a user, I can install Vaal Vibes on my phone and it feels app-like.
2. As a user, I can see an offline banner and still browse last-known content.
3. As a customer, I can recover from network errors without losing my request form.
4. As an admin, I can navigate dashboards quickly on mobile with no layout break.
5. As staff, I can trust promo validation results are consistent and logged.

**Delivered / Verified**
- End-to-end verification completed:
  - Public browse → customer register/login → wallet → request submit → admin login → CRUD event/special → validate + redeem promo.
- Rule validation:
  - **BR-1 enforcement** validated from UI + backend.
- Auditability:
  - Admin actions and promo validation/redemption write audit logs.
- PWA readiness checks:
  - Manifest fields, icons, and theme/background colors validated.
  - Service worker + offline shell behavior validated.
  - Install prompt behavior validated (when browser supports `beforeinstallprompt`).
- Testing results:
  - Testing Agent **iteration_2**: **backend 100%**, **frontend 100%**.
  - Previously reported issues resolved:
    - Login selectors fixed
    - Menu items visible by default
    - Promo validation/redeem stable after backend signature repair
    - Customer register/login/wallet/request flow working
    - Admin login/dashboard/CRUD working
    - Manifest/PWA assets valid

---

## 3) Next Actions (immediate)
1. **MVP is complete** — prepare handoff:
   - Provide demo credentials and demo MFA code to stakeholders.
   - Document which features are **MOCKED** (campaign dispatch, QR promo display, image uploads, forgot password).
2. Optional (post-MVP hardening):
   - Replace demo MFA with real TOTP.
   - Implement real email dispatch (SES) + unsubscribe flows.
   - Implement real image uploads (R2/S3) with resizing.
   - Expand menu seeding to include the full PDF catalog and richer search/filtering.
3. Monitoring / quality:
   - Add basic observability (request IDs, structured logs) and rate limiting if needed.

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
  - Clean end-to-end test run: **Testing Agent iteration_2 shows 100% backend and 100% frontend**.
