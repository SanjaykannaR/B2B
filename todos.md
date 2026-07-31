# B2B Logistics — Frontend Implementation Checklist

> **Important for all time**: We are only going to work on module [8, 9, 10, 14] only. Do not do other modules.
> **Stack:** React 18 + TypeScript + Tailwind CSS v4 + Redux Toolkit + Axios + Leaflet + Recharts

---

## Phase 1 — Foundation (Modules 8 + 10)
> These are dependencies for everything else. Build bottom-up.

### P0 — Module 10: Utilities & Constants (no deps, used everywhere)
- [x] `src/utils/constants.ts` — Role enums, status enums, status-to-color map, route paths
- [x] `src/utils/formatters.ts` — formatDate, formatCurrency, formatWeight, formatVolume, formatDistance, formatDuration, formatElapsedTime, formatTrackingId
- [x] `src/utils/validators.ts` — validateEmail, validatePhone, validateRequired, validatePositiveNumber, validatePassword

### P0 — Module 10: Axios API Instance
- [x] `src/services/api.ts` — Axios instance, baseURL from `VITE_API_URL`, JWT request interceptor, 401 response interceptor (clear token + redirect `/login`)

### P0 — Module 10: API Service Files (all depend on api.ts)
- [x] `src/services/authApi.ts` — login, register, getProfile, refreshToken, updateProfile (PUT /users/:id, local fallback)
- [x] `src/services/vehicleApi.ts` — getVehicles, getAvailableVehicles, getVehicleStats, createVehicle, updateVehicle, updateVehicleStatus, deleteVehicle
- [x] `src/services/manifestApi.ts` — getManifests, getMyManifests, getDriverManifests, getManifest, createManifest, updateManifest, assignManifest, startTrip, updateStatus, completeDelivery, cancelManifest
- [x] `src/services/invoiceApi.ts` — getInvoices, getMyInvoices, getInvoice, generateInvoice, markPaid, getInvoiceStats
- [x] `src/services/analyticsApi.ts` — getFleetUtilization, getRouteEfficiency, getMonthlyCapacity, getDeliveryPerformance, getRevenueSummary
- [x] `src/services/notificationApi.ts` — getNotifications, markRead, markAllRead, getUnreadCount

### P0 — Module 10: Custom Hooks
- [x] `src/hooks/useAuth.ts` — reads authSlice from Redux, returns `{ user, role, isAuthenticated, loading }`
- [x] `src/hooks/useLocalStorage.ts` — generic localStorage hook with JSON serialize/deserialize
- [x] `src/hooks/useDebounce.ts` — delays value updates (default 300ms) for search inputs
- [x] `src/hooks/useRecovery.ts` — reads UNIX timestamp from localStorage, computes elapsed time, resumes timer

### P1 — Module 9: Redux Store (depends on Module 10 services)
- [x] `src/store/authSlice.ts` — state: `{ user, token, isAuthenticated, loading, error }`, thunks: `loginUser`, `loadUser`, `logoutUser`, reducer: `updateUser` (profile save), localStorage JWT persistence
- [x] `src/store/manifestSlice.ts` — state: `{ manifests[], selectedManifest, filters, pagination }`, reducers: setManifests, selectManifest, setFilters, clearFilters
- [x] `src/store/vehicleSlice.ts` — state: `{ vehicles[], selectedVehicle, loading }`, reducers: setVehicles, selectVehicle, updateVehicleStatus
- [x] `src/store/uiSlice.ts` — state: `{ sidebarOpen, modalState, globalLoading }`, reducers: toggleSidebar, openModal, closeModal, setLoading
- [x] `src/store/store.ts` — `configureStore` combining all 4 slices, export `RootState` & `AppDispatch` types

### P1 — Module 8: App Entry Point (depends on Redux store)
- [x] `src/main.tsx` — render `<App />` wrapped in `<Provider>`, `<BrowserRouter>`, `<Toaster>`, import `globals.css`

---

## Phase 2 — Layout & Shared Components (Modules 11 + 12)
**[REMOVED by User: Do not implement Module 11 or 12]**

---

## Phase 3 — Module 14: Admin Pages
> Depends on Phases 1 + 2. Core admin experience.

### P1 — Admin Dashboard
- [x] `src/pages/admin/AdminDashboard.tsx` — 4 StatCards (Total Manifests, Active Vehicles, Pending Orders, Overdue) + recent manifests DataTable with StatusBadge + quick action buttons

### P2 — Fleet Monitor
- [x] `src/components/admin/AddEditVehicleModal.tsx` — vehicle create/edit form (registration, model, make, year, weight, volume, fuel efficiency)
- [x] `src/components/admin/FleetGrid.tsx` — vehicle DataTable with columns, StatusBadge, Edit/Delete actions
- [x] `src/pages/admin/FleetMonitor.tsx` — filter tabs (All/Available/In-Transit/Maintenance) + stat summary cards + FleetGrid

### P2 — Manifest Creation Wizard
- [x] `src/components/admin/ManifestWizard/StepPartner.tsx` — client dropdown, origin/destination addresses, pickup/delivery dates
- [x] `src/components/admin/ManifestWizard/StepCargo.tsx` — description, weight, volume, item count, hazmat toggle
- [x] `src/components/admin/ManifestWizard/StepRoute.tsx` — auto-suggested vehicles by capacity, distance/duration display, vehicle selection
- [x] `src/components/admin/ManifestWizard/WizardContainer.tsx` — 3-step manager, step indicator, localStorage persistence, validation per step, submit to API
- [x] `src/pages/admin/ManifestCreate.tsx` — renders WizardContainer page wrapper

### P3 — Live Operations
- [x] `src/components/admin/LiveMap.tsx` — Leaflet map with vehicle markers (color-coded), route polylines, marker popups
- [x] `src/components/admin/DispatchPanel.tsx` — manifest list for dispatch, driver/vehicle dropdowns, assign action
- [x] `src/components/admin/ManifestDetailModal.tsx` — full manifest view with ProgressStepper, timeline, action buttons
- [x] `src/pages/admin/LiveOperations.tsx` — LiveMap + DispatchPanel layout, manifest cards with live trip timers, status action buttons

---

## Build Order (Quick Reference)

```
1.  constants.ts
2.  formatters.ts
3.  validators.ts
4.  api.ts (Axios instance)
5.  All 6 API service files
6.  All 4 hooks
7.  All 4 Redux slices + store.ts
8.  main.tsx
9.  All 8 shared components
10. Layout: ProtectedRoute → Sidebar → Topbar → AppShell
11. App.tsx (router)
12. AdminDashboard
13. FleetMonitor + FleetGrid + AddEditVehicleModal
14. ManifestCreate + WizardContainer + 3 wizard steps
15. LiveOperations + LiveMap + DispatchPanel + ManifestDetailModal
```

---

### P2 — New Animation Hooks & Shared Components (added during UI rebuild)
- [x] `src/hooks/useInView.ts` — IntersectionObserver hook for scroll-triggered reveals
- [x] `src/hooks/useCountUp.ts` — Animated number counter with ease-out cubic
- [x] `src/components/admin/shared/AnimatedCard.tsx` — Scroll-triggered fade-in-up wrapper
- [x] `src/components/admin/shared/Skeleton.tsx` — Shimmer loading placeholder
- [x] `src/components/admin/shared/PageHeader.tsx` — Reusable page header with gradient underline
- [x] `src/components/admin/shared/StatCard.tsx` — Rewritten: count-up, glow hover, accent orb
- [x] `src/components/admin/shared/StatusBadge.tsx` — Rewritten: colored pills, pulsing dot

### P2 — Admin UI Rebuild (modern animations + Industrial Twilight theme)
- [x] `src/globals.css` — Moved from `src/styles/globals.css`. Added keyframes: shimmer, glowPulse, countReveal, barGrow, dotPulse. Added .skeleton, .reveal, .row-glow utilities. Tailwind `@import` must be first line.
- [x] `src/index.html` — Google Fonts `<link>` tags moved here (not in CSS) to avoid @import warning
- [x] `src/App.tsx` — Nav bar with design token colors
- [x] `src/pages/admin/AdminDashboard.tsx` — KPI count-up cards, recent manifests table, status distribution bars
- [x] `src/pages/admin/FleetMonitor.tsx` — Tab filters with animated underline, summary cards, grid
- [x] `src/pages/admin/ManifestCreate.tsx` — Ambient gradient blobs, wizard wrapper
- [x] `src/pages/admin/LiveOperations.tsx` — Split dispatch + map layout, demo trips, auto-refresh
- [x] `src/components/admin/FleetGrid.tsx` — Row-glow hover, action buttons on hover
- [x] `src/components/admin/DispatchPanel.tsx` — Trip cards with live timers
- [x] `src/components/admin/LiveMap.tsx` — Dark CartoDB tiles, truck markers
- [x] `src/components/admin/ManifestDetailModal.tsx` — Progress stepper, detail grid, action buttons
- [x] `src/components/admin/AddEditVehicleModal.tsx` — Form with design tokens
- [x] `src/components/admin/ManifestWizard/WizardContainer.tsx` — Animated progress stepper
- [x] `src/components/admin/ManifestWizard/StepPartner.tsx` — Origin/dest cards
- [x] `src/components/admin/ManifestWizard/StepCargo.tsx` — Hazmat toggle
- [x] `src/components/admin/ManifestWizard/StepRoute.tsx` — Vehicle selection cards
- [x] Deleted `src/styles/globals.css` (was emptied) and old `components/shared/StatCard.tsx` + `StatusBadge.tsx`
- [x] Build verified: 0 TypeScript errors, CSS 49.87 KB (gzipped 13.83 KB), JS 474.27 KB

---

### P2 — Navbar Redesign & Theme (2026-07-27)
- [x] `src/App.tsx` — Flex navbar: logo + nav links with icons + search bar (gradient glow) + settings gear
- [x] `src/App.tsx` — Active nav state: orange accent bg + glow shadow on current page
- [x] `src/App.tsx` — Sticky navbar: `sticky top-0 z-50`
- [x] `src/App.tsx` — Search bar: gradient border on focus, glow box-shadow, expanded width on focus
- [x] `src/App.tsx` — Settings icon links to `/admin/settings`
- [x] `src/globals.css` — Forced light theme: removed `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]` blocks
- [x] `src/globals.css` — Added `@keyframes gradientSpin` for search bar border animation

### P2 — Settings Page (2026-07-27)
- [x] `src/pages/admin/Settings.tsx` — Profile info: first name, last name, email, phone, company, role badge
- [x] `src/pages/admin/Settings.tsx` — Change password: current, new, confirm with show/hide toggle + validation
- [x] `src/pages/admin/Settings.tsx` — Logout button: dispatches logoutUser, redirects to `/login`

### P2 — All Manifests Page (2026-07-27)
- [x] `src/pages/admin/AllManifests.tsx` — Full manifest table with 9 columns
- [x] `src/pages/admin/AllManifests.tsx` — Search by tracking ID, client, city, cargo
- [x] `src/pages/admin/AllManifests.tsx` — Status filter tabs with counts (ALL, Pending, Assigned, In-Transit, Delivered, Delayed, Cancelled)
- [x] `src/pages/admin/AllManifests.tsx` — HAZ badge on hazardous shipments
- [x] `src/pages/admin/AllManifests.tsx` — Back button + Export button
- [x] `src/pages/admin/AdminDashboard.tsx` — "View All" button → `/admin/manifests`
- [x] `src/pages/admin/AdminDashboard.tsx` — "New Manifest" button → `/admin/manifests/new`
- [x] `src/App.tsx` — Added routes: `/admin/manifests`, `/admin/settings`

---

### P2 — Scoped Plan Items 8/9/14 + Settings API + Navbar UX (2026-07-31)
> From `client/src/future-my-module.md` (Developer 2 scope). Committed as `2a01172` on `sanjay`.

**Item 14 — Replace window.confirm() with Modal** ✅
- [x] `src/components/shared/ConfirmModal.tsx` — Fully implemented (was a Module 12 stub): `isOpen, onConfirm, onCancel, title, message, confirmText?, variant?` (danger/default), Escape-to-close, Enter-to-confirm, focus on confirm
- [x] `src/pages/admin/FleetMonitor.tsx` — `pendingDelete` state + `<ConfirmModal variant="danger" />`; no `window.confirm` remains in codebase

**Item 9 — Row Click → Detail Modal on All Manifests** ✅
- [x] `src/pages/admin/AllManifests.tsx` — `selected` state + row `onClick`
- [x] `src/components/admin/ManifestDetailModal.tsx` — rendered read-only (no `onAction`); cargo fallback `cargoDetails.* → cargo.* → top-level` for description & weight

**Item 8 — Pagination on All Tables** ✅
- [x] `src/pages/admin/AllManifests.tsx` — page-size selector (10/25/50/100), Prev/Next, "Page X of Y", "Showing X–Y of Z", reset-to-page-1 on search/filter change
- [x] `src/pages/admin/FleetMonitor.tsx` — same footer + local `useState` pagination, tab change resets page
- [ ] ⚠️ API-readiness gap: AllManifests sends hardcoded `page: 1` + limit; vehicleApi gets no page/limit — revisit when backend lands

**Item 10 — Make Settings Page API-Real** (partially done)
- [x] `src/services/authApi.ts` — `updateProfile(data, userId?)` → `PUT /users/:id`, try/catch + local fallback
- [x] `src/store/authSlice.ts` — `updateUser` reducer (merges + persists localStorage)
- [x] `src/pages/admin/Settings.tsx` — `handleProfileSave` wired to API + dispatch; demo-mode fallback works
- [ ] ⏳ **Blocked:** `changePassword()` → `PATCH /auth/change-password` — needs Developer 1 to implement endpoint (client-side validation already in place)

**Navbar UX (App.tsx)**
- [x] Notification bell + unread badge + dropdown (demo data, API-ready via `notificationApi`), mark-read / mark-all-read, closes on route change
- [x] Search bar widened: mobile 140px / sm 240px / md 300px / lg 380px (was collapsing to ~110px via `md:w-auto`)
- [x] Logo: black badge + orange `PackageSearch` icon + orange pin dot (tracking style); **clickable → `/admin`**
- [x] Dashboard KPI cards clickable: `StatCard` gained optional `to` prop → wraps in router `<Link>` (cursor-pointer, hover lift/glow kept; no "View details" footer per user preference)
  - Total Manifests → `/admin/manifests` · Active Vehicles → `/admin/fleet` · Pending Orders → `/admin/manifests` · Alerts/Delayed → `/admin/live`
- [x] `src/components/admin/shared/StatCard.tsx` — optional `to` prop + Link wrapper (design unchanged when not navigable)

**Verified:** `npx tsc --noEmit` passes (0 errors) after all changes.

---

## Notes

- **Backend is also stubbed** — no server code is implemented. The frontend API services will return nothing until the backend is built.
- **Mapbox replaced by Leaflet** — the codebase uses `react-leaflet` (free, no API key). The docs mention Mapbox but the package.json has Leaflet.
- **All files use TypeScript** (.ts / .tsx) — docs describe JavaScript but codebase is TS.
- **globals.css is fully implemented** — CSS variables (Industrial Twilight palette), animations, Tailwind v4 integration. `@import "tailwindcss"` MUST be first line.
- **Google Fonts loaded via `<link>` in index.html**, not CSS @import, to avoid Tailwind v4 ordering warnings.
- **package.json dependencies are installed** — `node_modules` exists in client.
- **All work goes to `sanjay` branch only** — never commit to `main`/`master`.
