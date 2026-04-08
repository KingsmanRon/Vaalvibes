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
  - Email/push/image-upload/code-generation beyond current backend must be labeled **MOCKED** in UI.
- Current status update:
  - **Backend foundation is complete and smoke-tested**.
  - Focus shifts to **Phase 2 (Frontend)**: brand-accurate UI, routing/shells, and end-to-end UX.

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
- Smoke testing completed:
  - Registration → wallet retrieval → request creation → admin login → promo validate → promo redeem (success).


### Phase 2 (In Progress): Frontend experience (customer + admin)
**User stories**
1. As a guest, I can browse a premium landing page and quickly jump to menu/events/specials.
2. As a customer, I can sign up/login and immediately see a welcome promo in my wallet.
3. As a customer, I can build a reservation/order intent (no payment) and submit it in under a minute.
4. As an admin, I can create/edit events and specials from my phone using drawers/sheets.
5. As staff, I can validate and redeem a promo in seconds with a big input and clear result card.

**Steps**
- Global brand tokens + layout rules (non-negotiables):
  - Update `index.css` tokens to match dark-first palette: **#111111 / #1A1A1A / #F5C518 / #FFFFFF / #B5B5B5**.
  - Load fonts: **Bebas Neue** (display) + **Space Grotesk** (body/UI).
  - Remove CRA centered styles from `App.css` and avoid global centering.
  - Enforce: no `transition: all`, minimal gradients (<=20% viewport), gold as accent only.
  - Add subtle noise overlay utility class per design guidelines.
- App routing + shells:
  - Customer: bottom nav (Home/Menu/Events/Wallet/Profile).
  - Admin: left rail on desktop + Sheet on mobile + top bar.
  - Shared: auth guard routes for customer/admin and token storage.
- Data layer:
  - Create API client wrapper (axios) with auth header injection.
  - Bootstrap fetch (`/public/bootstrap`) for menu/events/specials initial render.
  - Handle loading/error/empty states with shadcn Skeleton/Card + sonner toasts.
- Customer pages (mobile-first):
  - Home (hero + quick CTAs + specials/events blocks).
  - Menu (tabs + accordion; “add to request” opens drawer; **no payment** copy).
  - Events (filters; RSVP intent flows into request form).
  - Specials (grid + dialog; request CTA).
  - Auth (register/login) + Wallet + Profile/Preferences + My Requests.
  - Reservation/Order request multi-step flow w/ progress component + reference ID confirmation.
- Admin pages:
  - Admin login (email + password + OTP) with demo OTP helper text.
  - Dashboard KPIs + simple charts (Recharts optional) + recent requests.
  - Events CRUD (Sheet/Drawer editor with Calendar).
  - Specials CRUD.
  - Promo Pools CRUD / activate.
  - Promo Validate/Redeem screen (big input, status card, confirmation dialog).
  - Users list + Audit logs (expandable JSON payload).
  - Campaigns list + composer + **dispatch clearly labeled MOCKED**.
- Testability & QA hooks:
  - Ensure **data-testid** on all interactive and key informational elements.
  - Add consistent toast messages for success/error.


### Phase 3: PWA shell, verification, bug fixing
**User stories**
1. As a user, I can install Vaal Vibes on my phone and it feels app-like.
2. As a user, I can see an offline banner and still browse last-known content.
3. As a customer, I can recover from network errors without losing my request form.
4. As an admin, I can navigate dashboards quickly on mobile with no layout break.
5. As staff, I can trust promo validation results are consistent and logged.

**Steps**
- PWA:
  - Add manifest + icons + theme colors matching brand.
  - Service worker for offline shell + cache last-known menu/events/specials.
  - Offline banner (Alert).
  - Install prompt (Sheet after 2nd visit).
- Verification:
  - One full end-to-end pass:
    - Public browse → customer signup/login → wallet → request submit → admin login → CRUD event → validate/redeem promo.
  - Fix defects; polish spacing, contrast, nav, and motion preferences.

---

## 3) Next Actions (immediate)
1. Frontend: implement global theme tokens, fonts, and remove centered CRA styles.
2. Frontend: implement routing + customer bottom nav + admin shell.
3. Frontend: wire public bootstrap into Home/Menu/Events/Specials pages.
4. Frontend: implement customer auth + wallet + request flow with toasts and reference ID confirmation.
5. Frontend: implement admin login + dashboard + promo validate/redeem + events/specials CRUD.

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
- PWA:
  - Installable, offline banner visible, last-known content viewable when offline.
- Testability:
  - `data-testid` coverage for primary actions.
  - One clean end-to-end testing run with no critical failures.
