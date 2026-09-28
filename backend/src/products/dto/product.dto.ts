import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { Availability } from '../entities/product.entity';

export class ProductImageDto {
  @IsString() @IsNotEmpty() url: string;
  @IsOptional() @IsString() alt?: string;
  @IsOptional() @IsString() label?: string;
}

export class CreateProductDto {
  @IsString() @IsNotEmpty({ message: 'Enter a product name.' }) @MaxLength(100) name: string;
  @IsString() @IsNotEmpty({ message: 'Choose a category.' }) categoryId: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsNumber({}, { message: 'Enter a price, or leave it blank.' }) @Min(0) price?: number | null;
  @IsOptional() @IsEnum(Availability) availability?: Availability | null;
  @IsOptional() @IsString() materials?: string | null;
  @IsOptional() @IsArray() @ArrayMaxSize(8) @ValidateNested({ each: true }) @Type(() => ProductImageDto) images?: ProductImageDto[];
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @IsNotEmpty({ message: 'Enter a product name.' }) @MaxLength(100) name?: string;
  @IsOptional() @IsString() @IsNotEmpty({ message: 'Choose a category.' }) categoryId?: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsNumber({}, { message: 'Enter a price, or leave it blank.' }) @Min(0) price?: number | null;
  @IsOptional() @IsEnum(Availability) availability?: Availability | null;
  @IsOptional() @IsString() materials?: string | null;
  @IsOptional() @IsArray() @ArrayMaxSize(8) @ValidateNested({ each: true }) @Type(() => ProductImageDto) images?: ProductImageDto[];
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}
