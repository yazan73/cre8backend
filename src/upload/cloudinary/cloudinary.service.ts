// src/cloudinary/cloudinary.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse, v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  // Ensure provider config runs by injecting token
  constructor(@Inject('CLOUDINARY') private readonly _cloudinary: typeof cloudinary) {}

  async uploadImage(file: { buffer: Buffer; originalname?: string }): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'uploads',
          resource_type: 'auto',
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Unknown Cloudinary upload error'));
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async getImageUrl(publicId: string): Promise<string> {
    return cloudinary.url(publicId);
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  async uploadMultipleImages(files: Express.Multer.File[]): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }
}
