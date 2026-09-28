import { Body, Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { UpdateInquiryDto } from './dto/inquiry.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/inquiries')
export class InquiriesAdminController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  findAll(@Query('status') status?: string, @Query('type') type?: string, @Query('q') q?: string) {
    return this.inquiriesService.findAll({ status, type, q });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.inquiriesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inquiriesService.remove(id);
  }
}
