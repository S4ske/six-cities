import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../../shared/libs/logger/index.js';
import { Component } from '../../shared/types/index.js';
import { ExceptionFilter } from './exception-filter.interface.js';

@injectable()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
  ) {}

  public catch = (error: unknown, _req: Request, res: Response, next: NextFunction): void => {
    const normalizedError = error instanceof Error ? error : new Error(String(error));

    this.logger.error(`[AppException] ${normalizedError.message}`, normalizedError);

    if (res.headersSent) {
      next(normalizedError);
      return;
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    });
  };
}
