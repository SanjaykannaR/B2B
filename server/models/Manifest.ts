// This file is for: Manifest Mongoose model — core shipment lifecycle model
// Module: Database Models (Module 3)
// Owner: Developer 1 (Backend Engineer)
// Schema: trackingId, client, driver, vehicle, cargoDetails (description, weight, volume, itemCount, hazardous),
//         routing (origin/destination with coordinates), currentStatus, statusTimeline[],
//         scheduledPickup, scheduledDeliveryWindowClose, actualDeliveryTime, tripStartTimestamp
// Status lifecycle: Pending → Assigned → In-Transit → Delivered (or → Delayed/Cancelled)
// Indexes: trackingId, currentStatus, client+createdAt, driver+status, deliveryWindow+status
