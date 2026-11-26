import { Expose, Type } from 'class-transformer';
import { UserResponse } from './user.response.js';

export class CommentResponse {
  @Expose()
  public id!: string;

  @Expose()
  public text!: string;

  @Expose()
  public publishDate!: Date;

  @Expose()
  public rating!: number;

  @Expose()
  @Type(() => UserResponse)
  public author!: UserResponse;
}
