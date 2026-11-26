import { Expose } from 'class-transformer';
import { UserType } from '../../../types/index.js';

export class CreateUserDto {
  @Expose()
  public name!: string;

  @Expose()
  public email!: string;

  @Expose()
  public avatarPath?: string;

  @Expose()
  public password!: string;

  @Expose()
  public userType!: UserType;
}
