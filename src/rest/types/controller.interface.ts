import { Response, Router } from 'express';
import { Route } from './route.interface.js';

export interface ControllerInterface {
  readonly router: Router;
  addRoute(route: Route): void;
  send<T>(res: Response, statusCode: number, data: T): void;
  ok<T>(res: Response, data: T): void;
  created<T>(res: Response, data: T): void;
  noContent(res: Response): void;
  badRequest(res: Response, message: string): void;
  unauthorized(res: Response, message: string): void;
  forbidden(res: Response, message: string): void;
  notFound(res: Response, message: string): void;
  conflict(res: Response, message: string): void;
}
