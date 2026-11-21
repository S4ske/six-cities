import { Expose, Type } from 'class-transformer';
import { CoordinatesResponse } from './coordinates.response.js';

export class CityResponse {
  @Expose()
  public name!: string;

  @Expose()
  @Type(() => CoordinatesResponse)
  public coordinates!: CoordinatesResponse;
}
