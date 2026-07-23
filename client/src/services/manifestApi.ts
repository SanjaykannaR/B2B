// This file is for: Manifest API service — CRUD + assign + status lifecycle
// Module: Frontend API Services (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)
//
// What goes here:
// - getManifests(filters) → GET /manifests
// - getMyManifests() → GET /manifests/my (client)
// - getDriverManifests() → GET /manifests/driver/my
// - getManifest(id) → GET /manifests/:id
// - createManifest(data) → POST /manifests
// - updateManifest(id, data) → PUT /manifests/:id
// - assignManifest(id, driverId, vehicleId) → PATCH /manifests/:id/assign
// - startTrip(id, timestamp) → PATCH /manifests/:id/start-trip
// - updateStatus(id, status, note) → PATCH /manifests/:id/status
// - completeDelivery(id) → PATCH /manifests/:id/complete
// - cancelManifest(id) → DELETE /manifests/:id
