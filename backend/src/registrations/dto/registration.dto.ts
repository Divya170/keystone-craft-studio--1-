import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RegistrationStatus } from '../entities/registration.entity';

/** Loose at the transport layer — the comp's `vReg()` rules run in the service. */
export class SubmitRegistrationDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() workshop?: string;
  @IsOptional() @IsString() attendees?: string;
  @IsOptional() @IsString() message?: string;
}

export class UpdateRegistrationDto {
  @IsOptional() @IsEnum(RegistrationStatus, { message: 'Choose a valid status.' }) status?: RegistrationStatus;
  @IsOptional() @IsString() adminNotes?: string | null;
}
