import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { Logger } from '../../shared/libs/logger/index.js';
import { Component } from '../../shared/types/index.js';
import { toHttpError } from '../helpers/http-error-normalizer.js';
import { ExceptionFilter } from './exception-filter.interface.js';

@injectable()
export class HttpErrorExceptionFilter implements ExceptionFilter {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
  ) {}

  public catch = (error: unknown, _req: Request, res: Response, next: NextFunction): void => {
    const httpError = toHttpError(error);

    if (!httpError) {
      next(error);
      return;
    }

    this.logger.error(`[HttpError] ${httpError.statusCode}: ${httpError.message}`, httpError);

    if (res.headersSent) {
      next(httpError);
      return;
    }

    res.status(httpError.statusCode).json({
      statusCode: httpError.statusCode,
      message: httpError.message,
      ...(httpError.details ? { details: httpError.details } : {}),
    });
  };
}
