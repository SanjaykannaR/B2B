// Routes for: User notifications
// Module: Backend Routes (Module 4) | Owner: Developer 1
// Endpoints: GET /, PATCH /:id/read, PATCH /read-all, GET /unread-count

import { Router } from 'express';
import notificationController from '../controllers/notification.controller';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllNotificationsRead);
router.patch('/:id/read', notificationController.markNotificationRead);

export default router;
