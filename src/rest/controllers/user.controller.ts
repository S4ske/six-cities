import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../../shared/libs/logger/index.js';
import { Config, RestSchema } from '../../shared/libs/config/index.js';
import { Component } from '../../shared/types/index.js';
import { CreateUserDto, LoginUserDto, UserService } from '../../shared/modules/user/index.js';
import { HttpError } from '../errors/http-error.js';
import { createAccessToken } from '../helpers/auth.js';
import { fillDTO } from '../helpers/fill-dto.js';
import { toUserResponse } from '../helpers/response.mapper.js';
import { LoggedUserResponse } from '../responses/index.js';
import { HttpMethod } from '../types/http-method.enum.js';
import { Controller } from './controller.js';

const DEFAULT_AVATAR_URL = '/img/avatar.svg';

@injectable()
export class UserController extends Controller {
  constructor(
    @inject(Component.Logger) logger: Logger,
    @inject(Component.Config) config: Config<RestSchema>,
    @inject(Component.UserService) private readonly userService: UserService,
  ) {
    super(logger, config);

    this.addRoute({ path: '/users/register', method: HttpMethod.Post, handler: this.register });
    this.addRoute({ path: '/users/login', method: HttpMethod.Post, handler: this.login });
    this.addRoute({ path: '/users/login', method: HttpMethod.Get, handler: this.checkLoginStatus });
    this.addRoute({ path: '/users/logout', method: HttpMethod.Post, handler: this.logout });
    this.addRoute({ path: '/users/avatar', method: HttpMethod.Post, handler: this.uploadAvatar });
  }

  public async register(
    { body }: Request<Record<string, string>, Record<string, unknown>, CreateUserDto>,
    res: Response,
  ): Promise<void> {
    const dto = fillDTO(CreateUserDto, body);
    const existedUser = await this.userService.findByEmail(dto.email);

    if (existedUser) {
      throw new HttpError(StatusCodes.CONFLICT, `User with email «${dto.email}» already exists`);
    }

    const user = await this.userService.create(dto, this.config.get('SALT'));

    this.created(res, toUserResponse(user));
  }

  public async login(
    { body }: Request<Record<string, string>, Record<string, unknown>, LoginUserDto>,
    res: Response,
  ): Promise<void> {
    const dto = fillDTO(LoginUserDto, body);
    const user = await this.userService.verifyUser(dto, this.config.get('SALT'));

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
    }

    const token = createAccessToken(user.id, this.config.get('SALT'));

    this.ok(res, fillDTO(LoggedUserResponse, {
      token,
      user: toUserResponse(user),
    }));
  }

  public async checkLoginStatus(req: Request, res: Response): Promise<void> {
    const userId = this.requireUserId(req);
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
    }

    this.ok(res, toUserResponse(user));
  }

  public async logout(req: Request, res: Response): Promise<void> {
    this.requireUserId(req);
    this.noContent(res);
  }

  public async uploadAvatar(req: Request, res: Response): Promise<void> {
    const userId = this.requireUserId(req);
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
    }

    const avatarFromBody = (req.body as { avatar?: unknown } | undefined)?.avatar;
    const avatarUrl = typeof avatarFromBody === 'string'
      ? avatarFromBody
      : user.avatarPath || DEFAULT_AVATAR_URL;

    this.ok(res, { avatarUrl });
  }
}
