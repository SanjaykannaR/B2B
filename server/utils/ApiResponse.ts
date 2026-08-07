// Utility: Standardized API response { success, data, message }
// Module: Backend Utils | Owner: Developer 1

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export function ok<T>(data: T, message?: string): ApiResponseBody<T> {
  return { success: true, data, message };
}

export function created<T>(data: T, message?: string): ApiResponseBody<T> {
  return { success: true, data, message };
}

export default { ok, created };
