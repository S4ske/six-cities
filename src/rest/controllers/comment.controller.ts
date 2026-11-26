import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../../shared/libs/logger/index.js';
import { Config, RestSchema } from '../../shared/libs/config/index.js';
import { Component } from '../../shared/types/index.js';
import { CommentService, CreateCommentDto } from '../../shared/modules/comment/index.js';
import { OfferService } from '../../shared/modules/offer/index.js';
import { HttpError } from '../errors/http-error.js';
import { fillDTO } from '../helpers/fill-dto.js';
import { toCommentResponse } from '../helpers/response.mapper.js';
import { HttpMethod } from '../types/http-method.enum.js';
import { Controller } from './controller.js';

@injectable()
export class CommentController extends Controller {
  constructor(
    @inject(Component.Logger) logger: Logger,
    @inject(Component.Config) config: Config<RestSchema>,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {
    super(logger, config);

    this.addRoute({ path: '/offers/:offerId/comments', method: HttpMethod.Get, handler: this.find });
    this.addRoute({ path: '/offers/:offerId/comments', method: HttpMethod.Post, handler: this.create });
  }

  public async find(req: Request, res: Response): Promise<void> {
    await this.checkOfferExists(req.params.offerId);
    const comments = await this.commentService.findByOfferId(req.params.offerId);

    this.ok(res, comments.map(toCommentResponse));
  }

  public async create(
    req: Request<Record<string, string>, Record<string, unknown>, CreateCommentDto>,
    res: Response,
  ): Promise<void> {
    const userId = this.requireUserId(req);
    await this.checkOfferExists(req.params.offerId);
    const dto = fillDTO(CreateCommentDto, req.body);

    const comment = await this.commentService.create({
      ...dto,
      offerId: req.params.offerId,
      authorId: userId,
    });

    this.created(res, toCommentResponse(comment));
  }

  private async checkOfferExists(offerId: string): Promise<void> {
    const offer = await this.offerService.findById(offerId);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id «${offerId}» not found`);
    }
  }
}
