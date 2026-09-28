import { Type } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

export class SocialLinkDto {
  @IsString() label: string;
  @IsUrl({ require_protocol: true }, { message: 'Social links need a full URL, e.g. https://instagram.com/…' }) url: string;
}

export class UpdateSettingsDto {
  @IsOptional() @IsString() businessName?: string | null;
  @IsOptional() @IsString() city?: string | null;
  @IsOptional() @IsString() address?: string | null;
  @IsOptional() @IsString() hours?: string | null;
  @IsOptional() @IsString() email?: string | null;
  @IsOptional() @IsString() phone?: string | null;
  @IsOptional() @IsString() studioSummary?: string | null;
  @IsOptional() @IsString() story?: string | null;
  @IsOptional() @IsString() philosophyQuote?: string | null;
  @IsOptional() @IsString() philosophyText?: string | null;
  @IsOptional() @IsString() mapImage?: string | null;
  @IsOptional() @IsString() mapUrl?: string | null;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SocialLinkDto) socialLinks?: SocialLinkDto[];
  @IsOptional() @IsIn(['split', 'layered']) heroLayout?: 'split' | 'layered';
}
