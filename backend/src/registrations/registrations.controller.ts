import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { SubmitRegistrationDto } from './dto/registration.dto';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @HttpCode(201)
  submit(@Body() dto: SubmitRegistrationDto) {
    return this.registrationsService.submit(dto);
  }
}
