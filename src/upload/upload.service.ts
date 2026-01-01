import { Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import type { Express } from 'express';

@Injectable()
export class UploadService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async saveDesign(file: Express.Multer.File | { buffer: Buffer; originalname?: string }): Promise<string> {
    const res = await this.cloudinary.uploadImage({
      buffer: file.buffer,
      originalname: (file as any).originalname,
    });
    return res.secure_url;
  }
}
