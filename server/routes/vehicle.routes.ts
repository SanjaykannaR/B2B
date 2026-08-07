// Routes for: Vehicle fleet - CRUD + availability + stats
// Module: Backend Routes (Module 4) | Owner: Developer 1
// Endpoints: GET /, GET /available, GET /stats, POST /, PUT /:id, PATCH /:id/status, DELETE /:id

import { Router } from 'express';
import vehicleController from '../controllers/vehicle.controller';
import authMiddleware from '../middleware/auth';
import roleGuard from '../middleware/roleGuard';

const router = Router();

router.use(authMiddleware);

router.get('/', vehicleController.listVehicles);
router.get('/available', vehicleController.getAvailableVehicles);
router.get('/stats', vehicleController.getVehicleStats);
router.get('/:id', vehicleController.getVehicle);

router.post('/', roleGuard(['admin']), vehicleController.createVehicle);
router.put('/:id', roleGuard(['admin']), vehicleController.updateVehicle);
router.patch('/:id/status', roleGuard(['admin']), vehicleController.updateVehicleStatus);
router.delete('/:id', roleGuard(['admin']), vehicleController.deleteVehicle);

export default router;
