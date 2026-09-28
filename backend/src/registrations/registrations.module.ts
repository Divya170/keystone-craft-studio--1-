import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsAdminController } from './registrations.admin.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Registration, Workshop]), CommonModule],
  providers: [RegistrationsService],
  controllers: [RegistrationsController, RegistrationsAdminController],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
