import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { CommonModule } from '../common/common.module';
import { InquiriesModule } from '../inquiries/inquiries.module';
import { RegistrationsModule } from '../registrations/registrations.module';
import { ContentModule } from '../content/content.module';
import { SettingsModule } from '../settings/settings.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { WorkshopsModule } from '../workshops/workshops.module';

@Module({
  imports: [CommonModule, InquiriesModule, RegistrationsModule, ContentModule, SettingsModule, CategoriesModule, ProductsModule, WorkshopsModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
