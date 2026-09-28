import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InquiryStatus } from '../entities/inquiry.entity';

/** Loose at the transport layer — the comp's `vContact()` rules run in the service. */
export class SubmitInquiryDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() ref?: string;
  @IsOptional() @IsString() message?: string;
}

export class UpdateInquiryDto {
  @IsOptional() @IsEnum(InquiryStatus, { message: 'Choose a valid status.' }) status?: InquiryStatus;
  @IsOptional() @IsString() adminNotes?: string | null;
}
