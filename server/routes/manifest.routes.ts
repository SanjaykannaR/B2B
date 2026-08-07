// Routes for: Manifest shipment lifecycle
// Module: Backend Routes (Module 4) | Owner: Developer 1
// Endpoints: GET /, GET /my, GET /driver/my, GET /:id, POST /, PUT /:id, PATCH assign/start-trip/status/complete, DELETE /:id

import { Router } from 'express';
import manifestController from '../controllers/manifest.controller';
import authMiddleware from '../middleware/auth';
import roleGuard from '../middleware/roleGuard';

const router = Router();

router.use(authMiddleware);

router.get('/', roleGuard(['admin', 'executive']), manifestController.listManifests);
router.get('/my', roleGuard(['client']), manifestController.getMyManifests);
router.get('/driver/my', roleGuard(['driver']), manifestController.getDriverManifests);
router.get('/track/:trackingId', manifestController.getManifestByTrackingId);
router.get('/suggestions/:id', roleGuard(['admin']), manifestController.getCapacitySuggestions);
router.get('/:id', manifestController.getManifest);

router.post('/', roleGuard(['admin', 'client']), manifestController.createManifest);
router.put('/:id', roleGuard(['admin']), manifestController.updateManifest);
router.patch('/:id/assign', roleGuard(['admin']), manifestController.assignManifest);
router.patch('/:id/start-trip', roleGuard(['driver', 'admin']), manifestController.startTrip);
router.patch('/:id/status', roleGuard(['admin']), manifestController.updateManifestStatus);
router.patch('/:id/complete', roleGuard(['driver', 'admin']), manifestController.completeDelivery);
router.delete('/:id', roleGuard(['admin']), manifestController.cancelManifest);

export default router;
