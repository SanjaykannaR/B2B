// Utility: Custom error class with statusCode and message
// Module: Backend Utils | Owner: Developer 1
// Usage: throw new ApiError(404, 'Manifest not found')

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
