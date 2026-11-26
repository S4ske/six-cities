import { Expose } from 'class-transformer';

export class CreateCommentDto {
  @Expose()
  public text!: string;

  @Expose()
  public rating!: number;

  @Expose()
  public offerId!: string;

  @Expose()
  public authorId!: string;
}
