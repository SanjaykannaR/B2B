// This file is for: Role-based access control middleware
// Module: Backend Middleware (Module 2)
// Owner: Developer 1 (Backend Engineer)
//
// What goes here:
// - Takes array of allowed roles: roleGuard(['admin', 'executive'])
// - Checks req.user.role against allowed roles
// - Returns 403 Forbidden if user's role is not in the allowed list
