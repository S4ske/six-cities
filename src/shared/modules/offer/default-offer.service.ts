import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { OfferService } from './offer-service.interface.js';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { Logger } from '../../libs/logger/index.js';
import { City, Component } from '../../types/index.js';
import { UserService } from '../user/user-service.interface.js';
import type { CommentEntity } from '../comment/comment.entity.js';

const DEFAULT_OFFERS_COUNT = 60;
const MAX_PREMIUM_OFFERS_COUNT = 3;

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>,
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.UserService) private readonly userService: UserService
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create(dto);
    this.logger.info(`New offer created: ${dto.title}`);

    return result.populate('authorId');
  }

  public async findById(id: string, userId?: string): Promise<DocumentType<OfferEntity> | null> {
    const offer = await this.offerModel
      .findById(id)
      .populate('authorId')
      .exec();

    if (!offer) {
      return null;
    }

    const [result] = await this.setFavoriteStatus([offer], userId);

    return result;
  }

  public async find(limit = DEFAULT_OFFERS_COUNT, userId?: string): Promise<DocumentType<OfferEntity>[]> {
    if (limit <= 0) {
      return [];
    }

    const offers = await this.offerModel
      .find()
      .sort({ postDate: -1 })
      .limit(limit)
      .exec();

    return this.setFavoriteStatus(offers, userId);
  }

  public async updateById(
    id: string,
    dto: UpdateOfferDto,
    userId?: string
  ): Promise<DocumentType<OfferEntity> | null> {
    const offer = await this.offerModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('authorId')
      .exec();

    if (!offer) {
      return null;
    }

    const [result] = await this.setFavoriteStatus([offer], userId);

    return result;
  }

  public async deleteById(id: string): Promise<DocumentType<OfferEntity> | null> {
    await Promise.all([
      this.commentModel.deleteMany({ offerId: id }).exec(),
      this.userService.removeFavoriteOfferFromAllUsers(id),
    ]);

    return this.offerModel.findByIdAndDelete(id).exec();
  }

  public async findPremiumByCity(city: City, userId?: string): Promise<DocumentType<OfferEntity>[]> {
    const offers = await this.offerModel
      .find({ city, isPremium: true })
      .sort({ postDate: -1 })
      .limit(MAX_PREMIUM_OFFERS_COUNT)
      .exec();

    return this.setFavoriteStatus(offers, userId);
  }

  public async incCommentCount(id: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel
      .findByIdAndUpdate(id, { $inc: { commentCount: 1 } }, { new: true })
      .exec();
  }

  public async updateRating(id: string): Promise<DocumentType<OfferEntity> | null> {
    const [ratingData] = await this.commentModel.aggregate<{ rating: number }>([
      { $match: { offerId: new Types.ObjectId(id) } },
      { $group: { _id: null, rating: { $avg: '$rating' } } },
    ]);

    const rating = ratingData ? Math.round(ratingData.rating * 10) / 10 : 0;

    return this.offerModel
      .findByIdAndUpdate(id, { rating }, { new: true })
      .exec();
  }

  private async setFavoriteStatus(
    offers: DocumentType<OfferEntity>[],
    userId?: string
  ): Promise<DocumentType<OfferEntity>[]> {
    const favoriteOfferIds = userId ? await this.userService.findFavoriteOfferIds(userId) : [];
    const favoriteOfferIdSet = new Set(favoriteOfferIds);

    offers.forEach((offer) => {
      offer.isFavorite = favoriteOfferIdSet.has(offer.id);
    });

    return offers;
  }
}
