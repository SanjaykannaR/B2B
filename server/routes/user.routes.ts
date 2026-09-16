import { Router } from 'express';
import { body } from 'express-validator';
import {
  listUsers,
  getDrivers,
  getClients,
  getOne,
  createUser,
  updateUser,
  deactivateUser,
  resetPassword,
} from '../controllers/user.controller';
import { auth } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';

const router = Router();

// All user management is ADMIN-ONLY. roleGuard lets admin pass for any list.
router.use(auth);
router.use(roleGuard('admin'));

router.get('/', listUsers);
router.get('/drivers', getDrivers);
router.get('/clients', getClients);

router.post(
  '/',
  [
    body('firstName').notEmpty().withMessage('First name required'),
    body('lastName').notEmpty().withMessage('Last name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'client', 'driver', 'executive']).withMessage('Invalid role'),
  ],
  validate,
  createUser,
);

router.get('/:id', getOne);
router.put('/:id', updateUser);
router.patch('/:id/deactivate', deactivateUser);
router.post('/:id/reset-password', resetPassword);

export default router;
