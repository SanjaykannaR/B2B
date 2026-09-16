import { Router } from 'express';
import { list, markRead, markAllRead, unreadCount } from '../controllers/notification.controller';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth);

router.get('/', list);
router.get('/unread-count', unreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

export default router;
