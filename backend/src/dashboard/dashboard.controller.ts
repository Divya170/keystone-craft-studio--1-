import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { InquiriesService } from '../inquiries/inquiries.service';
import { RegistrationsService } from '../registrations/registrations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly inquiries: InquiriesService,
    private readonly registrations: RegistrationsService,
  ) {}

  @Get()
  get() {
    return this.dashboardService.get();
  }

  /** Sidebar badges. */
  @Get('badges')
  async badges() {
    const [inquiries, registrations] = await Promise.all([this.inquiries.countNew(), this.registrations.countNew()]);
    return { inquiries, registrations };
  }
}
