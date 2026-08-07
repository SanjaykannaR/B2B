// This file is for: express-validator chain wrapper
// Module: Backend Middleware (Module 2)
// Owner: Developer 1 (Backend Engineer)
//
// What goes here:
// - Reusable validate() middleware that runs express-validator checks
// - Returns 400 with validation errors if any checks fail

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export function validate(chains: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(chains.map((chain) => chain.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const messages = errors.array().map((e) => e.msg);
    res.status(400).json({
      success: false,
      message: messages.join('; '),
      errors: errors.array(),
    });
  };
}

export default validate;
