import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../../shared/libs/logger/index.js';
import { Config, RestSchema } from '../../shared/libs/config/index.js';
import { Component } from '../../shared/types/index.js';
import { OfferService } from '../../shared/modules/offer/index.js';
import { UserService } from '../../shared/modules/user/index.js';
import { HttpError } from '../errors/http-error.js';
import { toOfferListItemResponse } from '../helpers/response.mapper.js';
import { HttpMethod } from '../types/http-method.enum.js';
import { Controller } from './controller.js';

@injectable()
export class FavoritesController extends Controller {
  constructor(
    @inject(Component.Logger) logger: Logger,
    @inject(Component.Config) config: Config<RestSchema>,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {
    super(logger, config);

    this.addRoute({ path: '/favorites', method: HttpMethod.Get, handler: this.find });
    this.addRoute({ path: '/offers/:offerId/favorites', method: HttpMethod.Post, handler: this.add });
    this.addRoute({ path: '/offers/:offerId/favorites', method: HttpMethod.Delete, handler: this.remove });
  }

  public async find(req: Request, res: Response): Promise<void> {
    const userId = this.requireUserId(req);
    const offers = await this.userService.findFavoriteOffers(userId);

    if (!offers) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
    }

    this.ok(res, offers.map(toOfferListItemResponse));
  }

  public async add(req: Request, res: Response): Promise<void> {
    const userId = this.requireUserId(req);
    const offer = await this.offerService.findById(req.params.offerId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${req.params.offerId}» not found`);
    }

    await this.userService.addFavoriteOffer(userId, req.params.offerId);
    const favoriteOffer = await this.offerService.findById(req.params.offerId, userId);

    if (!favoriteOffer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${req.params.offerId}» not found`);
    }

    this.created(res, toOfferListItemResponse(favoriteOffer));
  }

  public async remove(req: Request, res: Response): Promise<void> {
    const userId = this.requireUserId(req);
    const offer = await this.offerService.findById(req.params.offerId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${req.params.offerId}» not found`);
    }

    await this.userService.removeFavoriteOffer(userId, req.params.offerId);
    this.noContent(res);
  }
}
