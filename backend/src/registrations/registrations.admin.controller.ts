import { Body, Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { UpdateRegistrationDto } from './dto/registration.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/registrations')
export class RegistrationsAdminController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('workshopId') workshopId?: string, @Query('q') q?: string) {
    return this.registrationsService.findAll({ status, workshopId, q });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRegistrationDto) {
    return this.registrationsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registrationsService.remove(id);
  }
}
