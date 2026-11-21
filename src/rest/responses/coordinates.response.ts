import { Expose } from 'class-transformer';

export class CoordinatesResponse {
  @Expose()
  public latitude!: number;

  @Expose()
  public longitude!: number;
}
