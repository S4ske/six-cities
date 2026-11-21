import { StatusCodes } from 'http-status-codes';
import { ErrorDetail, HttpError } from '../errors/http-error.js';

type ErrorWithStatus = Error & {
  status?: unknown;
  statusCode?: unknown;
  code?: unknown;
  type?: unknown;
  errors?: Record<string, { path?: string; message?: string }>;
};

function getClientStatusCode(error: ErrorWithStatus): number | null {
  for (const value of [error.status, error.statusCode]) {
    if (typeof value === 'number' && value >= 400 && value < 500) {
      return value;
    }
  }

  return null;
}

export function toHttpError(error: unknown): HttpError | null {
  if (error instanceof HttpError) {
    return error;
  }

  if (!(error instanceof Error)) {
    return null;
  }

  const clientError = error as ErrorWithStatus;

  if (clientError.type === 'entity.parse.failed') {
    return new HttpError(StatusCodes.BAD_REQUEST, 'Invalid JSON');
  }

  const statusCode = getClientStatusCode(clientError);

  if (statusCode) {
    return new HttpError(statusCode, clientError.message);
  }

  if (clientError.name === 'ValidationError') {
    const details: ErrorDetail[] = Object
      .values(clientError.errors ?? {})
      .map((item) => ({
        field: item.path ?? 'value',
        message: item.message ?? 'Invalid value',
      }));

    return new HttpError(StatusCodes.BAD_REQUEST, 'Validation failed', details);
  }

  if (clientError.name === 'CastError') {
    return new HttpError(StatusCodes.BAD_REQUEST, 'Invalid identifier');
  }

  if (clientError.code === 11000) {
    return new HttpError(StatusCodes.CONFLICT, 'Resource already exists');
  }

  return null;
}
