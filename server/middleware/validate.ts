import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/ApiResponse';

/**
 * Runs the accumulated express-validator checks on `req`.
 * Returns 400 with field errors if any check failed.
 * Usage: router.post('/login', [body('email').isEmail()], validate, handler)
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }
  next();
};
