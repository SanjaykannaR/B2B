# My Module — Scoped Work Plan (Items 8, 9, 10, 14, 15)

> Last updated: Aug 1, 2026
> Derived from `future.md` — scoped to MY module only (Developer 2 scope)
> EXCLUDED: Analytics (item 4) and all other items — owned by other developers

---

## Scope

| # | Item | Effort | Status |
|---|------|--------|--------|
| 8 | Pagination on All Tables | ~0.5 day | ✅ Done (minor API-readiness gap, see note) |
| 9 | Row Click → Detail Modal on All Manifests | ~0.5 day | ✅ Done |
| 10 | Make Settings Page API-Real | ~0.5-1 day | ⬜ Pending — only item left |
| 14 | Replace `window.confirm()` with Modal | ~0.25-0.5 day | ✅ Done |
| 15 | Swiggy/Zomato-style Animated Live Ops Map | ~2-3h | ✅ Done + smoke-tested 16/16 |

> Status verified against code: Jul 31, 2026

**Explicitly NOT in scope (other developers):** Analytics Dashboard (item 4), new pages (1-3), sidebar (5), UX polish (6-7, 11-13, 15), code quality (16-20).

---

## ⚠️ Important Context (read first)

1. **Entire `server/` is stub files** (comment-only controllers/routes). "Backend ready" in future.md = *contracts only*, not working code. All frontend work must keep the existing demo-data fallback.
2. **`ConfirmModal.tsx` is now implemented** (was a stub, Module 12). `DataTable.tsx` may still be a stub (Module 12, "Owner: Developer 3") — check before relying on it.
3. **Password-change endpoint does not exist** anywhere (frontend or backend) — coordination needed with Developer 1.

---

## Item 8 — Pagination on All Tables

**Files:** `client/src/pages/admin/AllManifests.tsx`, `client/src/store/manifestSlice.ts`, `client/src/pages/admin/FleetMonitor.tsx`, `client/src/components/admin/FleetGrid.tsx`

**Already done:** `manifestSlice.ts` has `pagination: { page, limit, total }`, `setPagination`, `setFilters` (auto-resets to page 1).

**Todo:**
- [x] Add page-size selector (10/25/50/100), prev/next buttons, "Page X of Y" + total count footer
- [x] Slice results client-side (works with demo data); also pass `{ page, limit }` to `manifestApi.getManifests()` for API-readiness
  - ⚠️ Note: AllManifests sends hardcoded `page: 1` + `limit`; FleetMonitor sends only `{ status }` — actual page/limit NOT yet sent to APIs. Works for demo data; revisit when backend lands.
- [x] Reset to page 1 on search/status filter change
- [x] Same treatment for vehicles table (no slice exists — use local `useState`)

## Item 9 — Row Click → Detail Modal on All Manifests

**Files:** `client/src/pages/admin/AllManifests.tsx`, `client/src/components/admin/ManifestDetailModal.tsx`

**Todo:**
- [x] Add `selected` state + `onClick` on rows (already have `cursor-pointer`)
- [x] Render `<ManifestDetailModal isOpen={!!selected} onClose={...} manifest={selected} />`
- [x] **Gotcha:** modal reads `manifest.cargo?.description` but AllManifests data uses `cargoDetails.*` — add fallback/normalize
  - Done: modal falls back `cargoDetails.* → cargo.* → top-level` for description & weight
- [x] Decide footer action buttons: omit `onAction` (decorative) or wire to `manifestApi` functions
  - Decision: omitted `onAction` — modal is read-only from AllManifests (footer only renders when handler passed)

## Item 10 — Make Settings Page API-Real

**Files:** `client/src/pages/admin/Settings.tsx`, `client/src/services/authApi.ts`, `client/src/store/authSlice.ts`

**Todo:**
- [x] Add `updateProfile(data)` to `authApi.ts` → `PUT /users/:id` (try/catch + local fallback until backend lands)
- [x] Add `updateUser` action in `authSlice.ts` → updates redux user + localStorage
- [x] Wire `handleProfileSave` to real API — dispatches `updateUser` with API result; local fallback keeps demo mode working
- [ ] **Blocked:** add `changePassword()` → `PATCH /auth/change-password` + coordinate with Developer 1 to implement it.
  - Status: client-side validation IS in place (required fields, min 6 chars, match check); API function + wiring still pending (blocked on Developer 1)

## Item 14 — Replace `window.confirm()` with Modal

**Files:** `client/src/pages/admin/FleetMonitor.tsx`, `client/src/components/shared/ConfirmModal.tsx`

**Todo:**
- [x] **Blocked by stub:** implement `ConfirmModal.tsx` (spec in its header: `isOpen, onConfirm, onCancel, title, message, confirmText?, variant?`, Escape-to-close, Enter-to-confirm)
  - Done: fully implemented with `variant: 'danger' | 'default'`, Escape-to-close + Enter-to-confirm, focus on confirm btn
- [x] Replace `window.confirm('Delete this vehicle?')` (FleetMonitor line 56) with `pendingDelete` state + `<ConfirmModal variant="danger" />`
  - Done: `pendingDelete` state + `<ConfirmModal variant="danger" />` in FleetMonitor; no `window.confirm` remains in code

## Item 15 — Swiggy/Zomato-style Animated Live Ops Map (NEW)

**Files:** `client/src/components/admin/LiveMap.tsx` (rewrite), `VehicleLayer.tsx` (new), `RouteLayer.tsx` (new), `TripInfoCard.tsx` (new), `client/src/utils/geo.ts` (new), `client/src/pages/admin/LiveOperations.tsx` (simulate prop), `client/src/globals.css` (+map keyframes)

**Goal:** Replace static jumping truck markers with a Swiggy/Zomato-style live tracking view. **No new npm packages** — Leaflet + CSS keyframes + one shared `requestAnimationFrame` loop.

**Todo:**
- [x] **Phase 1 — Animated vehicle markers** (`VehicleLayer.tsx`)
  - `L.divIcon` truck glyph + pulsing status ring (IN_TRANSIT=violet, DELAYED=red) replacing the flaticon image icon
  - One shared rAF loop lerps every truck from last-known → target position (ease-in-out, duration scaled by distance) — trucks glide between 30s polls instead of jumping
  - Heading rotation: truck glyph `rotate()`s toward direction of travel (bearing from prev→next)
  - Origin = small static dot, destination = pulsing radial dot (`@keyframes pulse-ring`)
  - Demo simulation: when data is `mock-*` (no real GPS), targets advance along the bezier route so the map is always alive
- [x] **Phase 2 — Animated route lines** (`RouteLayer.tsx`)
  - Base faint polyline (origin→destination) + bright dashed overlay with flowing `stroke-dashoffset` animation (`@keyframes dash-flow`)
  - Real roads via OSRM public API (`geometries=geojson`, no key, module-level cache, 4s AbortController timeout); fallback = quadratic bezier through a perpendicular control point
  - Selected trip: route glows full; others dim to ~40% opacity
- [x] **Phase 3 — Camera follow + selection UX** (`LiveMap.tsx` follow state)
  - Selecting a trip (dispatch card or marker click) → `flyTo` truck; when follow is on, map pans with the truck (threshold-gated, not per-frame)
  - Follow toggle button (paper-plane); clicking map unlocks
- [x] **Phase 4 — ETA / trip info overlay card** (`TripInfoCard.tsx`)
  - Floating glass card (top-left of map): tracking ID + StatusBadge, client, vehicle, animated progress bar (haversine origin→current / origin→dest), ETA (remaining km ÷ 40 km/h demo speed), View Details → (reuses `ManifestDetailModal`)
  - No selection → fleet summary (n trucks on road, n delayed)
- [x] **Phase 5 — Polish & performance**
  - `prefers-reduced-motion`: disable dash-flow, pulse rings, follow pan
  - Imperative marker position updates (no React re-render per frame); markers created once, `setLatLng` per frame
  - Marker tooltip = tracking ID (hover); marker click → select (no Leaflet popup — card shows details)
- [x] **Bug found + fixed during smoke test:** map container had `height: 0` — the map wrapper used `md:block` + `h-full`, and percentage heights against flex-derived parents collapse to 0 in Chrome/Edge. Fixed by mirroring the dispatch panel pattern: `md:block` → `md:flex` (LiveOperations.tsx). Map tiles now actually render.

**Gotchas:**
- Leaflet renders polylines as SVG → animate `stroke-dashoffset` in CSS; `!important` on `stroke-dasharray` to beat Leaflet inline styles
- `pathOptions.className` + `interactive: false` on polylines so routes never intercept clicks
- Position updates must be imperative (refs), never `setState` per frame
- Coordinate convention everywhere: `[lng, lat]` from API — convert to `[lat, lng]` at the Leaflet boundary

**Verification (headless Edge smoke test, `map-smoke`):** 16/16 assertions pass — markers render + move + rotate, routes flow, pins pulse, fleet card → trip card on selection, progress bar + ETA, follow toggle, no JS errors.

## Suggested Order

1. **Item 14** (~30 min) — smallest; proves ConfirmModal component
2. **Item 9** (~1 hr) — smallest-to-largest value
3. **Item 8** (~half day) — touches both tables
4. **Item 10** (~half day+) — last; has backend password dependency; do `updateProfile` half now, coordinate password change with Developer 1

---

## Team Dependencies

| Dependency | On whom | For |
|------------|---------|-----|
| Password-change endpoint (`PATCH /auth/change-password`) | Developer 1 (backend) | Item 10 |
| ConfirmModal implementation (or handoff) | Developer 3 (Module 12) | Item 14 |
| Backend user/manifest controllers being real | Developer 1 | Items 8, 10 API-readiness |
