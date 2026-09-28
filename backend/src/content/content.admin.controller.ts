import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentBlockDto, UpdateContentBlockDto } from './dto/content-block.dto';
import { ContentType } from './entities/content-block.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReorderDto } from '../common/dto/reorder.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/content')
export class ContentAdminController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  findAll(@Query('type') type?: ContentType) {
    return this.contentService.findAllAdmin(type);
  }

  @Post('reorder')
  reorder(@Body() dto: ReorderDto) {
    return this.contentService.reorder(dto.ids);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateContentBlockDto) {
    return this.contentService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContentBlockDto) {
    return this.contentService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }
}
