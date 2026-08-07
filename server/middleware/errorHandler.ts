import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/ApiResponse';

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

  // Duplicate key (unique index) — e.g. email, registrationNumber, trackingId
  if (anyErr && anyErr.code === 11000) {
    const field = Object.keys(anyErr.keyValue || {})[0] || 'field';
    return sendError(res, 409, `Duplicate value for '${field}'`);
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
    return sendError(res, 400, `Invalid id format for '${anyErr.path}'`);
  }

  console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  return sendError(res, 500, 'Internal server error');
};
