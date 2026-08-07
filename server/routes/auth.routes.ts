import { Router } from 'express';
import { body } from 'express-validator';
import { login, getMe, refresh, changePassword } from '../controllers/auth.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  login,
);

router.get('/me', auth, getMe);
router.post('/refresh', auth, refresh);

router.patch(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  auth,
  changePassword,
);

export default router;
