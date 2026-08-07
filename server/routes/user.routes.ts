// Routes for: User management (admin only)
// Module: Backend Routes (Module 4) | Owner: Developer 1
// Endpoints: GET /, GET /drivers, GET /clients, GET /:id, PUT /:id, PATCH /:id/deactivate

import { Router } from 'express';
import userController from '../controllers/user.controller';
import authMiddleware from '../middleware/auth';
import roleGuard from '../middleware/roleGuard';

const router = Router();

router.use(authMiddleware, roleGuard(['admin']));

router.get('/', userController.listUsers);
router.get('/drivers', userController.listDrivers);
router.get('/clients', userController.listClients);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.patch('/:id/deactivate', userController.deactivateUser);

export default router;
