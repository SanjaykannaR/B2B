// This file is for: ProtectedRoute — auth guard + role-based redirect
// Module: Frontend App Shell, Router & Layout (Module 11)
// Owner: Developer 2 (Web Frontend Engineer)
//
// What goes here:
// - Check if user is authenticated (JWT token exists + valid)
// - If not authenticated → redirect to /login
// - If authenticated but wrong role for this route → redirect to user's default dashboard
// - If authenticated and correct role → render children/outlet
// - Props: allowedRoles?: string[]
