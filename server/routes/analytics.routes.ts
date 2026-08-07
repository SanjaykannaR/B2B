// Routes for: Executive analytics aggregation queries
// Module: Backend Routes (Module 4) | Owner: Developer 1
// Endpoints: GET /fleet-utilization, /route-efficiency, /monthly-capacity, /delivery-performance, /revenue-summary

import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import authMiddleware from '../middleware/auth';
import roleGuard from '../middleware/roleGuard';

const router = Router();

router.use(authMiddleware, roleGuard(['executive', 'admin']));

router.get('/fleet-utilization', analyticsController.getFleetUtilization);
router.get('/route-efficiency', analyticsController.getRouteEfficiency);
router.get('/monthly-capacity', analyticsController.getMonthlyCapacity);
router.get('/delivery-performance', analyticsController.getDeliveryPerformance);
router.get('/revenue-summary', analyticsController.getRevenueSummary);

export default router;
