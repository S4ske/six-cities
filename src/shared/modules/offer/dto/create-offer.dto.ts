import { Expose } from 'class-transformer';
import { Amenity, City, HousingType, Location } from '../../../types/index.js';

export class CreateOfferDto {
  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

  @Expose()
  public city!: City;

  @Expose()
  public preview!: string;

  @Expose()
  public photos!: string[];

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public housingType!: HousingType;

  @Expose()
  public rooms!: number;

  @Expose()
  public guests!: number;

  @Expose()
  public price!: number;

  @Expose()
  public amenities!: Amenity[];

  @Expose()
  public coordinates!: Location;
}
