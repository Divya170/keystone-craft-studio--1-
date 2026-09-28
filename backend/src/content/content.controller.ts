import { Controller, Get, Query } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentType } from './entities/content-block.entity';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('faq')
  faq(@Query('q') q?: string, @Query('category') category?: string, @Query('home') home?: string) {
    return this.contentService.findFaq(q, category, home === 'true' || home === '1');
  }

  @Get('site-images')
  siteImages() {
    return this.contentService.siteImages();
  }

  @Get()
  findAll(@Query('type') type?: ContentType) {
    return this.contentService.findPublic(type);
  }
}
