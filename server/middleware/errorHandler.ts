import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/ApiResponse';
import { isProd } from '../config/env';

/**
 * Centralized error handler. Registered last in server.ts.
 * Maps ApiError / Mongoose validation / duplicate-key / CastError into
 * the standardized { success: false, message, errors? } JSON envelope.
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const anyErr = err as any;

  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  // Duplicate key (unique index) — don't leak field name in production
  if (anyErr && anyErr.code === 11000) {
    return sendError(res, 409, isProd ? 'Duplicate value' : `Duplicate value for '${Object.keys(anyErr.keyValue || {})[0] || 'field'}'`);
  }

  // Mongoose validation error
  if (anyErr && anyErr.name === 'ValidationError') {
    const messages: string[] = Object.values(anyErr.errors || {}).map(
      (e: any) => e.message,
    );
    return sendError(res, 400, messages[0] || 'Validation error', messages);
  }

  // Invalid ObjectId
  if (anyErr && anyErr.name === 'CastError') {
    return sendError(res, 400, 'Invalid ID format');
  }

  // Sanitized logging — no full URLs in production
  if (isProd) {
    console.error(`[error] ${req.method} ${req.path}`, anyErr?.message || 'unknown');
  } else {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }
  return sendError(res, 500, 'Internal server error');
};
