import { Container } from 'inversify';
import { RestApplication } from './rest.application.js';
import {
  CommentController,
  FavoritesController,
  OfferController,
  UserController,
} from './controllers/index.js';
import {
  AppExceptionFilter,
  ExceptionFilter,
  HttpErrorExceptionFilter,
} from './exception-filters/index.js';
import { ControllerInterface } from './types/controller.interface.js';
import { Logger, PinoLogger } from '../shared/libs/logger/index.js';
import { Config, RestConfig, RestSchema } from '../shared/libs/config/index.js';
import { DatabaseClient, MongoDatabaseClient } from '../shared/libs/database-client/index.js';
import { Component } from '../shared/types/index.js';

export function createRestApplicationContainer() {
  const container = new Container();

  container.bind<RestApplication>(Component.RestApplication).to(RestApplication).inSingletonScope();
  container.bind<Logger>(Component.Logger).to(PinoLogger).inSingletonScope();
  container.bind<Config<RestSchema>>(Component.Config).to(RestConfig).inSingletonScope();
  container.bind<DatabaseClient>(Component.DatabaseClient).to(MongoDatabaseClient).inSingletonScope();

  container.bind<ControllerInterface>(Component.UserController).to(UserController).inSingletonScope();
  container.bind<ControllerInterface>(Component.OfferController).to(OfferController).inSingletonScope();
  container.bind<ControllerInterface>(Component.FavoritesController).to(FavoritesController).inSingletonScope();
  container.bind<ControllerInterface>(Component.CommentController).to(CommentController).inSingletonScope();

  container.bind<ExceptionFilter>(Component.HttpErrorExceptionFilter).to(HttpErrorExceptionFilter).inSingletonScope();
  container.bind<ExceptionFilter>(Component.AppExceptionFilter).to(AppExceptionFilter).inSingletonScope();

  return container;
}
