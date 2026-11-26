import { Expose, Type } from 'class-transformer';
import { HousingType } from '../../shared/types/index.js';
import { CityResponse } from './city.response.js';

export class OfferListItemResponse {
  @Expose()
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public publishDate!: Date;

  @Expose()
  @Type(() => CityResponse)
  public city!: CityResponse;

  @Expose()
  public preview!: string;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public housingType!: HousingType;

  @Expose()
  public price!: number;

  @Expose()
  public commentsCount!: number;
}
