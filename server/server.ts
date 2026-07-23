// This file is for: Express app entry point — server.js
// Module: Backend Configuration & Server Setup (Module 1)
// Owner: Developer 1 (Backend Engineer)
//
// What goes here:
// - Load dotenv config
// - Import and call db.js to connect MongoDB
// - Create Express app
// - Enable CORS (using config/cors.js)
// - Enable JSON body parsing (limit: 10mb)
// - Register all API routes:
//     /api/auth          → auth.routes.js
//     /api/users         → user.routes.js
//     /api/vehicles      → vehicle.routes.js
//     /api/manifests     → manifest.routes.js
//     /api/invoices      → invoice.routes.js
//     /api/analytics     → analytics.routes.js
//     /api/notifications → notification.routes.js
// - Health check: GET /api/health
// - Global error handler middleware
// - Start overdueSweep cron job
// - Listen on PORT (default 5000)
