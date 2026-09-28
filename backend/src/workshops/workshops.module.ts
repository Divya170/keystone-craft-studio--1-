import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workshop } from './entities/workshop.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { WorkshopsService } from './workshops.service';
import { WorkshopsController } from './workshops.controller';
import { WorkshopsAdminController } from './workshops.admin.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Workshop, Registration]), CommonModule],
  providers: [WorkshopsService],
  controllers: [WorkshopsController, WorkshopsAdminController],
  exports: [WorkshopsService],
})
export class WorkshopsModule {}
