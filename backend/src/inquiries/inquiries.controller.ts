import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { SubmitInquiryDto } from './dto/inquiry.dto';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @HttpCode(201)
  submit(@Body() dto: SubmitInquiryDto) {
    return this.inquiriesService.submit(dto);
  }
}
