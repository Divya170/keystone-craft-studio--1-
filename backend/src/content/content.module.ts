import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentBlock } from './entities/content-block.entity';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { ContentAdminController } from './content.admin.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContentBlock]), CommonModule],
  providers: [ContentService],
  controllers: [ContentController, ContentAdminController],
  exports: [ContentService],
})
export class ContentModule {}
