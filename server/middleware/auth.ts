// This file is for: JWT verification middleware + user attach
// Module: Backend Middleware (Module 2)
// Owner: Developer 1 (Backend Engineer)
//
// What goes here:
// - Read token from Authorization: Bearer <token> header
// - Verify token using JWT_SECRET
// - Decode payload, find user by ID
// - Attach user object to req.user
// - Return 401 if no token or invalid token
