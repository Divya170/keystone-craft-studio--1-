import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional } from 'class-validator';
import { ContentType } from '../entities/content-block.entity';

export class CreateContentBlockDto {
  @IsEnum(ContentType)
  type: ContentType;

  @IsObject()
  fields: Record<string, any>;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateContentBlockDto {
  @IsOptional()
  @IsObject()
  fields?: Record<string, any>;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
