import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentBlock } from '../content/entities/content-block.entity';
import { Category } from '../categories/entities/category.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContentBlock, Category, Workshop])],
  providers: [SeedService],
})
export class SeedModule {}
