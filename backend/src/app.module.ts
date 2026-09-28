import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { UploadsModule } from './common/uploads/uploads.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { SettingsModule } from './settings/settings.module';
import { ContentModule } from './content/content.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH || join(__dirname, '..', '..', 'database', 'app.sqlite'),
      autoLoadEntities: true,
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), process.env.UPLOADS_DIR || 'uploads'),
      serveRoot: '/uploads',
    }),
    UploadsModule,
    AdminAuthModule,
    SettingsModule,
    ContentModule,
    CategoriesModule,
    ProductsModule,
    WorkshopsModule,
    RegistrationsModule,
    InquiriesModule,
    DashboardModule,
    SeedModule,
  ],
})
export class AppModule {}
