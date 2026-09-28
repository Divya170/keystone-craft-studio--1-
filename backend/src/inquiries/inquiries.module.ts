import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquiry } from './entities/inquiry.entity';
import { InquiriesService } from './inquiries.service';
import { InquiriesController } from './inquiries.controller';
import { InquiriesAdminController } from './inquiries.admin.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry]), CommonModule],
  providers: [InquiriesService],
  controllers: [InquiriesController, InquiriesAdminController],
  exports: [InquiriesService],
})
export class InquiriesModule {}
