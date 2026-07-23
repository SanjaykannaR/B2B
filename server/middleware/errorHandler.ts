// This file is for: Centralized error handler middleware
// Module: Backend Middleware (Module 2)
// Owner: Developer 1 (Backend Engineer)
//
// What goes here:
// - Catches all errors from route handlers
// - Logs error details
// - Returns structured JSON: { success: false, message, statusCode }
// - Handles ApiError instances, mongoose validation errors, duplicate key errors
