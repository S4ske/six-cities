import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { City } from '../../types/index.js';

export interface OfferService {
  create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>>;
  findById(id: string, userId?: string): Promise<DocumentType<OfferEntity> | null>;
  find(limit?: number, userId?: string): Promise<DocumentType<OfferEntity>[]>;
  updateById(id: string, dto: UpdateOfferDto, userId?: string): Promise<DocumentType<OfferEntity> | null>;
  deleteById(id: string): Promise<DocumentType<OfferEntity> | null>;
  findPremiumByCity(city: City, userId?: string): Promise<DocumentType<OfferEntity>[]>;
  incCommentCount(id: string): Promise<DocumentType<OfferEntity> | null>;
  updateRating(id: string): Promise<DocumentType<OfferEntity> | null>;
}
