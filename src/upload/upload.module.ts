import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Module({
  providers: [UploadService, CloudinaryProvider, CloudinaryService],
  exports: [UploadService],
})
export class UploadModule {}
