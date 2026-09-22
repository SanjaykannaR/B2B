import { Router } from 'express';
import {
  listManifests,
  getOne,
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
router.get('/', roleGuard('admin', 'executive', 'client', 'driver'), listManifests);
router.get('/driver/my', roleGuard('driver'), getDriverManifests);
router.get('/driver/requests', roleGuard('driver'), myDeliveryRequests);
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

// ── Trip lifecycle (driver) ──────────────────────────────────────
router.patch('/:id/start-trip', roleGuard('driver'), startTrip);
router.patch('/:id/location', roleGuard('driver'), updateLocation);
router.patch('/:id/status', roleGuard('admin', 'driver'), updateStatus);
router.patch('/:id/complete', roleGuard('driver'), completeManifest);

// ── Driver delivery requests ─────────────────────────────────────
router.patch('/:id/accept', roleGuard('driver'), acceptDriverRequest);
router.patch('/:id/decline', roleGuard('driver'), declineDriverRequest);

export default router;
