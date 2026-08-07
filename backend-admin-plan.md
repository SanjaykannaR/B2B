# Backend Plan — Admin Page (the "Mind" Hub)

> Scope: **admin page only**. Design leaves room for client/driver/executive pages (same backend, role-based). Admin Settings gets a **Create Role-Based User** section so accounts made here can log in and auto-redirect to their own page via JWT role.
> Current state: `server/` is 100% comment-only stubs. Frontend contracts are already fixed in `client/src/services/*.ts` and must be matched exactly.
> Real-time: REST + polling now, WebSocket upgrade later.

---

## 1. Architecture Overview

One Express app, one MongoDB, four frontend roles. The JWT carries `role`; every login response returns `{ token, user }` where `user.role` drives frontend redirect:

| role | redirect |
|---|---|
| `admin` | `/admin` |
| `client` | `/client/dashboard` |
| `driver` | `/driver/dashboard` |
| `executive` | `/executive/analytics` |

**Request/response conventions**
- Response: `{ success: true, data, message }` (via `utils/ApiResponse.ts`)
- Error: `{ success: false, message, errors? }` with proper status code (via `utils/ApiError.ts`)
- Auth: `Authorization: Bearer <JWT>` → `middleware/auth.ts` attaches `req.user`
- Access control: `middleware/roleGuard(['admin', ...])` → 403 if role not allowed

---

## 2. Real-Time Workflow — how the 4 pages communicate (dispatcher flow)

This is the exact cross-page flow the backend must serve. Admin is the hub; client, driver, executive are the spokes.

```
1. Admin creates accounts (client + driver)        POST /api/users  (Settings)
2. Client logs in (JWT role=client → /client)      POST /api/auth/login
3. Client places an order                           POST /api/manifests  → requestStatus=PENDING
4. Admin sees the request (Client Requests)          GET /api/manifests?requestStatus=PENDING
5. Admin approves OR rejects (notifies client)       PATCH /api/manifests/:id/approve | /reject
6. Admin picks an available driver + vehicle            GET /api/users/drivers + GET /api/vehicles/available
7. Admin sends delivery request to that driver           POST /api/manifests/:id/driver-request  → notify driver
8. Driver accepts (→ Assigned, vehicle locked)        PATCH /api/delivery-requests/:id/accept  → notify admin+client
9. Driver loads goods + taps start trip               PATCH /api/manifests/:id/start-trip     → "ready to deliver", notify admin+client
10. Live tracking (admin map + client tracker)        PATCH /api/manifests/:id/location (driver pings) + GET /api/manifests/:id (poll)
11. Driver completes delivery                         PATCH /api/manifests/:id/complete       → vehicle free, invoice generated
12. Admin & client get success confirmation           notifications + invoice + status Delivered
```

Key backend additions this flow requires (beyond the original docs):
- **Approval step** — `requestStatus` on Manifest (PENDING → APPROVED/REJECTED/CONTACTED), separate from dispatch.
- **Driver request/accept flow** — not direct-assign. `driverRequest` sub-document; driver accepts/declines.
- **Live location pings** — `lastLocation` + `PATCH /manifests/:id/location`, read by admin map and client tracker via polling.

---

## 3. Database Models (implement in `server/models/`)

All stubs → full Mongoose schemas. Fields come from `B2B_Logistics_Complete_Plan.txt` §4.

| File | Model | Key fields | Notes |
|---|---|---|---|
| `User.ts` | User | firstName, lastName, email(unique), password(`select:false`), role(`admin\|client\|driver\|executive`), phone, company, licenseNumber, contractRate, isActive | `pre('save')` bcrypt(12), `comparePassword()`, indexes: email, role, role+isActive |
| `Vehicle.ts` | Vehicle | registrationNumber(unique), model, make, year, maxWeightKg, maxVolumeCubicMeters, status(`Available\|In-Transit\|Maintenance`), currentDriver, fuelEfficiencyKmPerLiter, lastMaintenanceDate | indexes: status, registrationNumber |
| `Manifest.ts` | Manifest | trackingId(auto `TRK-XXXXXX`), client, **gstNumber**(per order), driver, vehicle, cargoDetails{description,totalWeightKg,totalVolumeCubicMeters,itemCount,isHazardous}, routing{origin,destination,estimatedDistanceKm,estimatedDurationMinutes}, currentStatus(`Pending\|Assigned\|In-Transit\|Delivered\|Delayed\|Cancelled`), **requestStatus**(`PENDING\|APPROVED\|REJECTED\|CONTACTED`), **driverRequest**{driverId, vehicleId, status(`pending\|accepted\|declined\|cancelled`), sentAt, respondedAt}, **lastLocation**{lat, lng, heading, updatedAt}, statusTimeline[], scheduledPickup, scheduledDeliveryWindowClose, actualDeliveryTime, tripStartTime, tripStartTimestamp | indexes: trackingId, currentStatus, client+createdAt, driver+currentStatus, scheduledDeliveryWindowClose+currentStatus, driverRequest.driverId+status |
| `Invoice.ts` | Invoice | invoiceNumber(auto `INV-...`), manifest, client, amount, currency, status(`Pending\|Paid\|Overdue\|Cancelled`), issuedDate, dueDate, paidDate, lineItems[] | indexes: client+status, invoiceNumber |
| `Notification.ts` | Notification | recipient, title, message, type(`info\|warning\|success\|error`), isRead, relatedManifest | index: recipient+isRead |

---

## 4. Middleware (implement in `server/middleware/`)

| File | Purpose |
|---|---|
| `auth.ts` | Read Bearer token → verify JWT → load user → `req.user`. 401 on missing/invalid. **Skip password field.** |
| `roleGuard.ts` | `roleGuard('admin')` / `roleGuard('admin','executive')` → 403 if `req.user.role` not allowed |
| `validate.ts` | Wrapper around `express-validator` chains, returns 400 with field errors |
| `errorHandler.ts` | Central error catcher → `ApiError` → JSON. Logs + DB rollback hooks where needed |

---

## 5. Services (implement in `server/services/`)

| File | Purpose |
|---|---|
| `routeCalculator.ts` | Haversine distance (km) + duration estimate from origin/destination coordinates |
| `capacityMatcher.ts` | Auto-suggest compatible vehicles for a manifest's weight/volume (used by Manifest Wizard Step 3) |
| `invoiceGenerator.ts` | Build invoice line items from delivered manifest: `distance × client.contractRate` |
| `emailService.ts` | Nodemailer wrapper (config via `.env`, soft-fail in dev) |
| `cron/overdueSweep.ts` | Nightly: manifests past `scheduledDeliveryWindowClose` + not delivered → `Delayed` + notification (+email) |

---

## 6. Auth — the role-redirect heart

`server/routes/auth.routes.ts` + `controllers/auth.controller.ts`

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/login` | Public | verify email+password → `{ token, user }`; **`user.role` drives frontend redirect**; reject `isActive=false` |
| GET | `/api/auth/me` | Authenticated | current user from token |
| POST | `/api/auth/refresh` | Authenticated | new token |
| PATCH | `/api/auth/change-password` | Authenticated | **NEW (not in docs)** — required by Settings page: currentPassword + newPassword |

**Account creation is ADMIN-ONLY** (confirmed): no public `/register`. The only way accounts are created is admin → `POST /api/users` (Section 7 → Settings "Create Role-Based User"). Seed script creates the initial admin account.

---

## 7. Users — Admin account factory (Settings "Create Role-Based User")

`server/routes/user.routes.ts` + `controllers/user.controller.ts` — **all admin-only**

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/users` | Paginated list, filters: `role`, `search` (name/email), `page`, `limit` |
| GET | `/api/users/drivers` | `role=driver` (Manifest Wizard / Dispatch dropdowns) |
| GET | `/api/users/clients` | `role=client` (Wizard Step 1, invoices) |
| GET | `/api/users/:id` | Single user |
| POST | `/api/users` | **Create role-based user** — body: `{ firstName, lastName, email, password, role, company?, phone?, licenseNumber?, contractRate? }`. **The ONLY account-creation path.** |
| PUT | `/api/users/:id` | Update profile (Settings saves via this) |
| PATCH | `/api/users/:id/deactivate` | Soft-delete `isActive=false` (blocks login) |
| POST | `/api/users/:id/reset-password` | Optional — admin resets a user's password |

**Flow (per your requirement):** Admin opens Settings → "Create User" section → picks role (client/driver/executive/admin) + email + password → `POST /api/users` → user appears in `/users/drivers` or `/users/clients`. That user logs in via `/auth/login`, JWT says `role=client`, frontend redirects them to the client page. **Login must reject `isActive=false`.**

---

## 8. Vehicles — Fleet Monitor

`server/routes/vehicle.routes.ts` + `controllers/vehicle.controller.ts`

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/api/vehicles` | Admin/Executive | filters: `status`, `page`, `limit` |
| GET | `/api/vehicles/available` | Admin/Executive | `status=Available` (Wizard Step 3 + Dispatch) |
| GET | `/api/vehicles/stats` | Executive | counts: total / available / in-transit / maintenance |
| POST | `/api/vehicles` | Admin | create (AddEditVehicleModal) |
| PUT | `/api/vehicles/:id` | Admin | edit |
| PATCH | `/api/vehicles/:id/status` | Admin | change status |
| DELETE | `/api/vehicles/:id` | Admin | remove (ConfirmModal) |

---

## 9. Manifests — All Manifests, Dashboard, Wizard, Live Ops, Client Requests

`server/routes/manifest.routes.ts` + `controllers/manifest.controller.ts`

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/api/manifests` | Admin | filters: `status`, `requestStatus`, `startDate`, `endDate`, `client`, `search` (trackingId/client/city), `page`, `limit`. Dashboard uses `limit:5`. Response: `{ manifests, pagination: { page, limit, total } }` |
| GET | `/api/manifests/:id` | All roles | full detail + timeline (ManifestDetailModal). Client/driver get own manifests only. |
| POST | `/api/manifests` | Admin/Client | Admin = Wizard submit. **Client = Place Order** → `requestStatus=PENDING`, `currentStatus=Pending`. Role-aware. |
| PUT | `/api/manifests/:id` | Admin | edit |
| PATCH | `/api/manifests/:id/approve` | Admin | **NEW — approval step.** `requestStatus=PENDING→APPROVED` + timeline + notify client. |
| PATCH | `/api/manifests/:id/reject` | Admin | `requestStatus=REJECTED`, `currentStatus=Cancelled` + timeline + notify client (reason note). |
| PATCH | `/api/manifests/:id/contact` | Admin | `requestStatus=CONTACTED` flag (client outreach, per Client Requests page) |
| POST | `/api/manifests/:id/driver-request` | Admin | **NEW — dispatch.** body `{ driverId, vehicleId }` → create `driverRequest{driverId, vehicleId, status:pending}` + notify driver "new delivery request". **One driver at a time; admin picks driver AND vehicle.** |
| PATCH | `/api/delivery-requests/:id/accept` | Driver | driver accepts → `driverRequest.status=accepted`, `driver=driverId`, `currentStatus=Assigned`, vehicle→In-Transit, notify admin+client. |
| PATCH | `/api/delivery-requests/:id/decline` | Driver | `status=declined` → admin notified, picks another driver |
| PATCH | `/api/manifests/:id/assign` | Admin | (fallback direct assignment if we also keep it — see §11) |
| PATCH | `/api/manifests/:id/start-trip` | Driver | stores `tripStartTimestamp`, status→`In-Transit`, notify admin+client "ready to deliver / in transit" |
| PATCH | `/api/manifests/:id/location` | Driver | **NEW — live tracking.** driver pings `{lat, lng, heading}` (interval polling), stored in `lastLocation`. Admin map + client tracker read it via `GET /manifests/:id`. |
| PATCH | `/api/manifests/:id/status` | Admin/Driver | transition + timeline push + notification |
| PATCH | `/api/manifests/:id/complete` | Driver | status→`Delivered`, `actualDeliveryTime=now`, **vehicle→Available**, **auto-generate invoice**, notify admin+client success |
| DELETE | `/api/manifests/:id` | Admin | cancel (only from Pending/Assigned), timeline entry `Cancelled` |

**Status lifecycle + timeline:** every transition appends `{ status, timestamp, note, updatedBy }` to `statusTimeline` (audit trail shown in ManifestDetailModal).

**Real workflow lifecycle (per the dispatcher flow):**
```
Client order  →  Pending (requestStatus=PENDING)
Admin approve →  Approved (requestStatus=APPROVED)   [still Pending, awaiting dispatch]
Admin sends driver request →  driverRequest=pending  [driver notified]
Driver accepts →  Assigned (driver+vehicle set)
Driver loads goods + start trip →  In-Transit  [admin & client notified "ready to deliver"]
Live tracking via location pings (admin map + client tracker)
Driver complete →  Delivered  [invoice auto-gen, admin & client notified success]
Reject / Cancel →  Cancelled · Overdue sweep →  Delayed
```

**Status values note (IMPORTANT):** AllManifests/Dashboard/Live Ops use `PENDING / ASSIGNED / IN_TRANSIT / DELIVERED / DELAYED / CANCELLED` (uppercase). The Client Requests page uses its own `PENDING / APPROVED / REJECTED / CONTACTED` set → **open decision in Section 11.**

---

## 10. Invoices + Notifications (admin-backend-ready)

`server/routes/invoice.routes.ts`, `server/routes/notification.routes.ts` + controllers

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/api/invoices` | Admin | all invoices, filterable |
| GET | `/api/invoices/:id` | Admin/Client | detail |
| POST | `/api/invoices/generate/:manifestId` | System | auto on delivery complete; also callable by admin |
| PATCH | `/api/invoices/:id/pay` | Admin | mark paid |
| GET | `/api/invoices/stats` | Executive | totals: billed / paid / pending / overdue |
| GET | `/api/notifications` | Authenticated | own, newest first |
| PATCH | `/api/notifications/:id/read` | Authenticated | mark one |
| PATCH | `/api/notifications/read-all` | Authenticated | mark all |
| GET | `/api/notifications/unread-count` | Authenticated | topbar badge |

**Notification triggers** (created server-side on events): new client order → admin; admin approves → client; driver request sent → driver; driver accepts → admin + client; start-trip / in-transit → admin + client; location pings (no notification, polling only); complete → admin + client success; overdue sweep → client + admin; invoice generated → client.

---

## 11. Analytics (admin subset, roleGuard admin|executive)

`server/routes/analytics.routes.ts` + `controllers/analytics.controller.ts` — MongoDB aggregation pipelines (§9 of plan):

| Endpoint | Pipeline |
|---|---|
| `GET /api/analytics/fleet-utilization` | `$facet` byStatus + totalWeight + avgEfficiency |
| `GET /api/analytics/route-efficiency` | Delivered: estimated vs actual duration |
| `GET /api/analytics/monthly-capacity` | `$match` Delivered by month → sum weight/volume/count |
| `GET /api/analytics/delivery-performance` | Delivered vs Delayed % |
| `GET /api/analytics/revenue-summary` | Invoice `$group` by month → revenue/paid/pending |

---

## 12. Open Decisions — RESOLVED (locked 2026-08-06)

1. **Driver request flow** → **One driver at a time.** Admin sends to a single available driver; on decline admin picks another. `driverRequest` sub-document on Manifest.
2. **Vehicle selection** → **Admin picks both driver + vehicle** when sending the request.
3. **Approval vs dispatch** → two separate steps. Approving does NOT auto-assign a driver.
4. **Live tracking** → **Driver sends real GPS pings** (`PATCH /manifests/:id/location`); admin map + client tracker poll.
5. **GST** → **Per order** (`gstNumber` on Manifest), filled by client when placing the order.
6. **Account creation** → **Admin-only.** No public register. Only `POST /api/users`.
7. **`change-password`** → added (`PATCH /auth/change-password`).
8. **Real-time** → polling now, WebSocket later.

### Remaining integration questions (for when you coordinate with client/driver teams)
- Driver page needs: `GET /delivery-requests/my` (pending requests), `accept`/`decline`, `start-trip`, `location`, `complete`.
- Client page needs: place order (`POST /manifests` with `gstNumber`), approval notification, `GET /manifests/my`, tracker (`GET /manifests/:id`).
- Confirm driver location ping interval (e.g. every 10s) + how stale positions should be treated.

---

## 13. Implementation Order (admin page → full build)

1. **Phase A — Foundation:** `env.ts`, `db.ts`, `cors.ts`, `ApiError`/`ApiResponse`/`helpers`, all 5 models, middleware (auth, roleGuard, validate, errorHandler), `server.ts` wiring all routes + `GET /api/health`.
2. **Phase B — Auth:** auth controller/routes (login/register/me/refresh/change-password), JWT + roleGuard verified with seed users.
3. **Phase C — Users:** list/drivers/clients/get/update/deactivate/**create**. → Settings "Create Role-Based User" + login-redirect works end-to-end.
4. **Phase D — Vehicles:** full CRUD + available + stats → Fleet Monitor live.
5. **Phase E — Manifests:** CRUD + approval + driver-request/accept + `routeCalculator` + `capacityMatcher` + start-trip + location + complete (+ invoice trigger) → Dashboard / AllManifests / Wizard / Client Requests / Live Ops live.
6. **Phase F — Invoices + Notifications:** generate/pay/stats + notification CRUD + event triggers → future Invoice page + topbar bell.
7. **Phase G — Analytics + Cron + Seeds:** 5 aggregation endpoints, `overdueSweep`, full seed data (admin@logistics.com, clients, drivers, vehicles TRK-001..005).

## 14. Seed Accounts (for login-redirect testing)

| Email | Password | Role | Redirect |
|---|---|---|---|
| admin@logistics.com | admin123 | admin | /admin |
| exec@logistics.com | exec123 | executive | /executive/analytics |
| client@abc.com | client123 | client | /client/dashboard |
| driver1@logistics.com | driver123 | driver | /driver/dashboard |

---

## 15. Out of scope (this pass) — noted so design doesn't break them

| Page | Endpoints needed later (already reserved above) |
|---|---|
| Client | place order via `POST /manifests` (with `gstNumber`), `GET /manifests/my`, approval notification, tracking via `GET /manifests/:id`, `GET /invoices/my` |
| Driver | `GET /manifests/driver/my`, pending `GET /delivery-requests/my`, `accept`/`decline`, `start-trip`, `status`, `location`, `complete` |
| Executive | vehicles `/stats`, invoices `/stats`, all `/analytics/*` |

All these live in the same route files; admin build leaves the endpoint shapes correct so the other pages can be wired later without schema changes.
