import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesAdminController } from './categories.admin.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product]), CommonModule],
  providers: [CategoriesService],
  controllers: [CategoriesController, CategoriesAdminController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
