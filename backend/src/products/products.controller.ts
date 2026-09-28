import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  shop(@Query('q') q?: string, @Query('category') category?: string, @Query('availability') availability?: string, @Query('sort') sort?: string) {
    return this.productsService.shop({ q, category, availability, sort });
  }

  @Get('featured')
  featured() {
    return this.productsService.featured();
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.productsService.bySlug(slug);
  }
}
