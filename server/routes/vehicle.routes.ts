import { Router } from 'express';
import {
  listVehicles,
  getAvailable,
  getStats,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle,
} from '../controllers/vehicle.controller';
import { auth } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(auth);

router.get('/', roleGuard('admin', 'executive'), listVehicles);
router.get('/available', roleGuard('admin', 'executive'), getAvailable);
router.get('/stats', roleGuard('admin', 'executive'), getStats);

router.post('/', roleGuard('admin'), createVehicle);
router.put('/:id', roleGuard('admin'), updateVehicle);
router.patch('/:id/status', roleGuard('admin'), updateVehicleStatus);
router.delete('/:id', roleGuard('admin'), deleteVehicle);

export default router;
