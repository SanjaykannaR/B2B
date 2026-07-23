// This file is for: BrowserRouter + all route definitions
// Module: Frontend App Shell, Router & Layout (Module 11)
// Owner: Developer 2 (Web Frontend Engineer)
//
// What goes here:
// - Load user on mount if JWT token exists in localStorage
// - Define all routes using React Router v6 nested routes:
//     /login           → Login.tsx
//     /admin/*         → Admin pages (dashboard, fleet, manifest, live ops)
//     /client/*        → Client pages (dashboard, order, track, invoices)
//     /driver/*        → Driver pages (dashboard, active delivery)
//     /executive/*     → Executive pages (analytics)
//     *                → NotFound.tsx (404)
// - Wrap protected routes in <ProtectedRoute> → <AppShell>
// - Redirect unauthenticated users to /login
