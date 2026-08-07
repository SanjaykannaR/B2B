import { Router } from 'express';
import {
  listManifests,
  getOne,
  getMy,
  getDriverManifests,
  createManifest,
  updateManifest,
  approveManifest,
  rejectManifest,
  contactManifest,
  sendDriverRequest,
  assignManifest,
  startTrip,
  updateLocation,
  updateStatus,
  completeManifest,
  deleteManifest,
  myDeliveryRequests,
  acceptDriverRequest,
  declineDriverRequest,
} from '../controllers/manifest.controller';
import { auth } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(auth);

// ── Reads ────────────────────────────────────────────────────────
router.get('/', roleGuard('admin', 'executive'), listManifests);
router.get('/my', getMy);
router.get('/driver/my', getDriverManifests);
router.get('/:id', getOne);

// ── Create / edit ────────────────────────────────────────────────
router.post('/', createManifest);
router.put('/:id', roleGuard('admin'), updateManifest);
router.delete('/:id', roleGuard('admin'), deleteManifest);

// ── Approval workflow (Client Requests) ─────────────────────────
router.patch('/:id/approve', roleGuard('admin'), approveManifest);
router.patch('/:id/reject', roleGuard('admin'), rejectManifest);
router.patch('/:id/contact', roleGuard('admin'), contactManifest);

// ── Dispatch workflow ────────────────────────────────────────────
router.post('/:id/driver-request', roleGuard('admin'), sendDriverRequest);
router.patch('/:id/assign', roleGuard('admin'), assignManifest);

// ── Trip lifecycle (driver; admin has full access) ───────────────
router.patch('/:id/start-trip', roleGuard('driver'), startTrip);
router.patch('/:id/location', roleGuard('driver'), updateLocation);
router.patch('/:id/status', roleGuard('admin', 'driver'), updateStatus);
router.patch('/:id/complete', roleGuard('driver'), completeManifest);

// ── Driver delivery requests (separate namespace per plan) ───────
export const deliveryRequestRouter = Router();
deliveryRequestRouter.use(auth);
deliveryRequestRouter.get('/my', myDeliveryRequests);
deliveryRequestRouter.patch('/:id/accept', roleGuard('driver'), acceptDriverRequest);
deliveryRequestRouter.patch('/:id/decline', roleGuard('driver'), declineDriverRequest);

export default router;
