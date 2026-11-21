import { Expose, Type } from 'class-transformer';
import { Amenity } from '../../shared/types/index.js';
import { CoordinatesResponse } from './coordinates.response.js';
import { OfferListItemResponse } from './offer-list-item.response.js';
import { UserResponse } from './user.response.js';

export class DetailedOfferResponse extends OfferListItemResponse {
  @Expose()
  public description!: string;

  @Expose()
  public photos!: string[];

  @Expose()
  public rooms!: number;

  @Expose()
  public guests!: number;

  @Expose()
  public amenities!: Amenity[];

  @Expose()
  @Type(() => CoordinatesResponse)
  public coordinates!: CoordinatesResponse;

  @Expose()
  @Type(() => UserResponse)
  public author!: UserResponse;
}
