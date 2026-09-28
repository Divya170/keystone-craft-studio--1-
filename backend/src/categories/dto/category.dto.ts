import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString() @IsNotEmpty({ message: 'Enter a category name.' }) @MaxLength(60) name: string;
  @IsOptional() @IsString() @MaxLength(120) description?: string | null;
  @IsOptional() @IsString() image?: string | null;
  @IsOptional() @IsString() imageAlt?: string | null;
  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateCategoryDto {
  @IsOptional() @IsString() @IsNotEmpty({ message: 'Enter a category name.' }) @MaxLength(60) name?: string;
  @IsOptional() @IsString() @MaxLength(120) description?: string | null;
  @IsOptional() @IsString() image?: string | null;
  @IsOptional() @IsString() imageAlt?: string | null;
  @IsOptional() @IsBoolean() published?: boolean;
}
