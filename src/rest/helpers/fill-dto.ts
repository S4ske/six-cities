import { ClassConstructor, plainToInstance } from 'class-transformer';

export function fillDTO<T>(dto: ClassConstructor<T>, plainObject: object): T {
  return plainToInstance(dto, plainObject, { excludeExtraneousValues: true });
}
