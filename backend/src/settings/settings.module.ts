import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settings } from './entities/settings.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SettingsAdminController } from './settings.admin.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Settings]), CommonModule],
  providers: [SettingsService],
  controllers: [SettingsController, SettingsAdminController],
  exports: [SettingsService],
})
export class SettingsModule {}
