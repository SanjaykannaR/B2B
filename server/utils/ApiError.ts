export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, unknown>;

  constructor(statusCode: number, message: string, errors?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}
