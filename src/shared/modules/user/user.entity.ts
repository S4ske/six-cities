import { defaultClasses, getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import type { OfferEntity } from '../offer/offer.entity.js';
import { User, UserType } from '../../types/index.js';
import { createSHA256 } from '../../helpers/hash.js';

export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users',
    timestamps: true,
  }
})
export class UserEntity extends defaultClasses.TimeStamps implements User {
  @prop({ required: true, trim: true, type: () => String })
  public name!: string;

  @prop({ required: true, unique: true, trim: true, type: () => String })
  public email!: string;

  @prop({ required: false, default: '', type: () => String })
  public avatarPath?: string;

  @prop({ required: true, type: () => String })
  public password!: string;

  @prop({ required: true, type: () => String, enum: UserType })
  public type!: UserType;

  @prop({ ref: 'OfferEntity', default: [], type: () => [String] })
  public favoriteOffers!: Ref<OfferEntity>[];

  constructor(userData: User) {
    super();

    this.name = userData.name;
    this.email = userData.email;
    this.avatarPath = userData.avatarPath;
    this.type = userData.type;
  }

  public setPassword(password: string, salt: string): void {
    this.password = createSHA256(password, salt);
  }

  public getPassword(): string {
    return this.password;
  }

  public verifyPassword(password: string, salt: string): boolean {
    return this.password === createSHA256(password, salt);
  }
}

export const UserModel = getModelForClass(UserEntity);
