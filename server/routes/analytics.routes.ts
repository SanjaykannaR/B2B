import { Router } from 'express';
import {
  fleetUtilization,
  routeEfficiency,
  monthlyCapacity,
  deliveryPerformance,
  revenueSummary,
} from '../controllers/analytics.controller';
import { auth } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(auth);
router.use(roleGuard('admin', 'executive'));

router.get('/fleet-utilization', fleetUtilization);
router.get('/route-efficiency', routeEfficiency);
router.get('/monthly-capacity', monthlyCapacity);
router.get('/delivery-performance', deliveryPerformance);
router.get('/revenue-summary', revenueSummary);

export default router;
