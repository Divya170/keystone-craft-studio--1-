import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, Min, ValidateIf } from 'class-validator';
import { WorkshopStatus } from '../entities/workshop.entity';

const DT_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/;

export class CreateWorkshopDto {
  @IsString() @IsNotEmpty({ message: 'Enter a workshop title.' }) @MaxLength(100) title: string;
  @IsOptional() @IsString() summary?: string | null;
  @IsOptional() @IsString() details?: string | null;
  @IsOptional() @IsString() image?: string | null;
  @IsOptional() @IsString() imageAlt?: string | null;
  @IsOptional() @IsEnum(WorkshopStatus, { message: 'Choose a status.' }) status?: WorkshopStatus;
  @IsOptional() @IsString() @ValidateIf((_, v) => v !== '') @Matches(DT_RE, { message: 'Enter a valid date and time.' }) startsAt?: string | null;
  @IsOptional() @IsString() duration?: string | null;
  @IsOptional() @IsNumber({}, { message: 'Enter a price, or leave it blank.' }) @Min(0) price?: number | null;
  @IsOptional() @IsInt({ message: 'Capacity must be a whole number.' }) @Min(1, { message: 'Capacity must be at least 1.' }) capacity?: number | null;
  @IsOptional() @IsString() materials?: string | null;
  @IsOptional() @IsString() location?: string | null;
  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateWorkshopDto {
  @IsOptional() @IsString() @IsNotEmpty({ message: 'Enter a workshop title.' }) @MaxLength(100) title?: string;
  @IsOptional() @IsString() summary?: string | null;
  @IsOptional() @IsString() details?: string | null;
  @IsOptional() @IsString() image?: string | null;
  @IsOptional() @IsString() imageAlt?: string | null;
  @IsOptional() @IsEnum(WorkshopStatus, { message: 'Choose a status.' }) status?: WorkshopStatus;
  @IsOptional() @IsString() @ValidateIf((_, v) => v !== '') @Matches(DT_RE, { message: 'Enter a valid date and time.' }) startsAt?: string | null;
  @IsOptional() @IsString() duration?: string | null;
  @IsOptional() @IsNumber({}, { message: 'Enter a price, or leave it blank.' }) @Min(0) price?: number | null;
  @IsOptional() @IsInt({ message: 'Capacity must be a whole number.' }) @Min(1, { message: 'Capacity must be at least 1.' }) capacity?: number | null;
  @IsOptional() @IsString() materials?: string | null;
  @IsOptional() @IsString() location?: string | null;
  @IsOptional() @IsBoolean() published?: boolean;
}
