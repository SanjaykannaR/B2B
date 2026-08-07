// This file is for: Centralized error handler middleware
// Module: Backend Middleware (Module 2)
// Owner: Developer 1 (Backend Engineer)
//
// What goes here:
// - Catches all errors from route handlers
// - Logs error details
// - Returns structured JSON: { success: false, message, statusCode }
// - Handles ApiError instances, mongoose validation errors, duplicate key errors

import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import ApiError from '../utils/ApiError';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  let statusCode = 500;
  let message = 'Internal server error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
  } else if ((err as { code?: number }).code === 11000) {
    statusCode = 409;
    const key = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue ?? {}).join(', ');
    message = `Duplicate value${key ? ` for field${key.includes(',') ? 's' : ''}: ${key}` : ''}.`;
  } else if (err instanceof Error) {
    message = err.message;
  }

  console.error(`[Error] ${statusCode} — ${message}`);
  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

export default errorHandler;
