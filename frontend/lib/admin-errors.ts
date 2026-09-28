import { ApiError } from './api';

export interface ApiErrorInfo {
  /** General message to show in a banner. */
  message: string;
  /** Per-field messages, keyed by field name (from `{ errors: { field: msg } }` bodies). */
  fields: Record<string, string>;
}

/**
 * Normalizes the two error shapes the API returns:
 *  - `{ message, errors: { field: msg } }` (custom BadRequestException bodies)
 *  - `{ statusCode, message: string[] | string, error }` (default ValidationPipe bodies)
 */
export function errorInfo(err: unknown, fallback = 'Something went wrong. Please try again.'): ApiErrorInfo {
  if (!(err instanceof ApiError)) return { message: fallback, fields: {} };
  const body = err.body;
  const fields: Record<string, string> = (body && typeof body.errors === 'object' && body.errors) || {};
  let message: string;
  if (typeof body?.message === 'string') message = body.message;
  else if (Array.isArray(body?.message)) message = body.message.join(' ');
  else message = err.message || fallback;
  return { message, fields };
}
