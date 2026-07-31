# My Module — Scoped Work Plan (Items 8, 9, 10, 14)

> Last updated: Jul 31, 2026
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

---

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
