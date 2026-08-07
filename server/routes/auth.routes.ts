// Routes for: Auth - login, register, me, refresh
// Module: Backend Routes (Module 4) | Owner: Developer 1
// Endpoints: POST /register, POST /login, GET /me, POST /refresh

import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import authMiddleware from '../middleware/auth';
import validate from '../middleware/validate';

const router = Router();

router.post(
  '/register',
  validate([
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ]),
  authController.register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login
);

router.get('/me', authMiddleware, authController.getMe);

router.post('/refresh', authController.refreshToken);

export default router;
