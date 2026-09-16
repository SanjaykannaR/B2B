import { Response } from 'express';

/**
 * Standardized success envelope: { success, message, ...payload, data }
 * Object payloads are spread at the top level (so `res.manifests`,
 * `res.user`, `res.token` work) AND exposed under `data` per the plan's
 * `{ success, data, message }` contract. Array payloads go under `data`.
 */
export const sendSuccess = (
  res: Response,
  payload: Record<string, unknown> | unknown[] = {},
  message = 'Success',
  statusCode = 200,
): Response => {
  const body: Record<string, unknown> = { success: true, message };
  if (Array.isArray(payload)) {
    body.data = payload;
  } else {
    Object.assign(body, payload);
    body.data = payload;
  }
  return res.status(statusCode).json(body);
};

/** Standardized error envelope: { success: false, message, errors? } */
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown,
): Response => {
  const body: Record<string, unknown> = { success: false, message };
  if (errors !== undefined && errors !== null) body.errors = errors;
  return res.status(statusCode).json(body);
};
