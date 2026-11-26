import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../../shared/libs/logger/index.js';
import { Config, RestSchema } from '../../shared/libs/config/index.js';
import { City, Component } from '../../shared/types/index.js';
import { CreateOfferDto, OfferService, UpdateOfferDto } from '../../shared/modules/offer/index.js';
import { HttpError } from '../errors/http-error.js';
import { fillDTO } from '../helpers/fill-dto.js';
import {
  getReferenceId,
  toDetailedOfferResponse,
  toOfferListItemResponse,
} from '../helpers/response.mapper.js';
import { HttpMethod } from '../types/http-method.enum.js';
import { Controller } from './controller.js';

@injectable()
export class OfferController extends Controller {
  constructor(
    @inject(Component.Logger) logger: Logger,
    @inject(Component.Config) config: Config<RestSchema>,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {
    super(logger, config);

    this.addRoute({ path: '/offers', method: HttpMethod.Get, handler: this.find });
    this.addRoute({ path: '/offers', method: HttpMethod.Post, handler: this.create });
    this.addRoute({ path: '/offers/:offerId', method: HttpMethod.Get, handler: this.findById });
    this.addRoute({ path: '/offers/:offerId', method: HttpMethod.Put, handler: this.update });
    this.addRoute({ path: '/offers/:offerId', method: HttpMethod.Delete, handler: this.delete });
    this.addRoute({ path: '/cities/:city/premium', method: HttpMethod.Get, handler: this.findPremiumByCity });
  }

  public async find(req: Request, res: Response): Promise<void> {
    const limit = this.parseLimit(req.query.limit);
    const userId = this.getUserId(req) ?? undefined;
    const offers = await this.offerService.find(limit, userId);

    this.ok(res, offers.map(toOfferListItemResponse));
  }

  public async create(
    req: Request<Record<string, string>, Record<string, unknown>, CreateOfferDto>,
    res: Response,
  ): Promise<void> {
    const userId = this.requireUserId(req);
    const dto = fillDTO(CreateOfferDto, req.body);
    const offer = await this.offerService.create(dto, userId);

    this.created(res, toDetailedOfferResponse(offer));
  }

  public async findById(req: Request, res: Response): Promise<void> {
    const userId = this.getUserId(req) ?? undefined;
    const offer = await this.offerService.findById(req.params.offerId, userId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${req.params.offerId}» not found`);
    }

    this.ok(res, toDetailedOfferResponse(offer));
  }

  public async update(
    req: Request<Record<string, string>, Record<string, unknown>, UpdateOfferDto>,
    res: Response,
  ): Promise<void> {
    const userId = this.requireUserId(req);
    const { params, body } = req;
    const dto = fillDTO(UpdateOfferDto, body);
    const offer = await this.offerService.findById(params.offerId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${params.offerId}» not found`);
    }

    if (getReferenceId(offer.authorId) !== userId) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'You can update only your own offers');
    }

    const updatedOffer = await this.offerService.updateById(params.offerId, dto, userId);

    if (!updatedOffer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${params.offerId}» not found`);
    }

    this.ok(res, toDetailedOfferResponse(updatedOffer));
  }

  public async delete(req: Request, res: Response): Promise<void> {
    const userId = this.requireUserId(req);
    const offer = await this.offerService.findById(req.params.offerId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${req.params.offerId}» not found`);
    }

    if (getReferenceId(offer.authorId) !== userId) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'You can delete only your own offers');
    }

    await this.offerService.deleteById(req.params.offerId);
    this.noContent(res);
  }

  public async findPremiumByCity(req: Request, res: Response): Promise<void> {
    const city = req.params.city as City;

    if (!Object.values(City).includes(city)) {
      throw new HttpError(StatusCodes.BAD_REQUEST, `Unknown city «${req.params.city}»`);
    }

    const userId = this.getUserId(req) ?? undefined;
    const offers = await this.offerService.findPremiumByCity(city, userId);

    this.ok(res, offers.map(toOfferListItemResponse));
  }

  private parseLimit(value: unknown): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    const limit = Number(value);

    if (!Number.isInteger(limit) || limit < 0) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Limit must be a non-negative integer');
    }

    return limit;
  }
}
