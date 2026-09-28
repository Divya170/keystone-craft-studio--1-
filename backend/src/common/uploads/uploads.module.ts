import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { UploadsController } from './uploads.controller';
import { CommonModule } from '../common.module';

@Module({
  imports: [
    CommonModule,
    MulterModule.register({
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || 'uploads',
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${uuid()}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.heic'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) return cb(new Error('Only image files are allowed.'), false);
        cb(null, true);
      },
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
