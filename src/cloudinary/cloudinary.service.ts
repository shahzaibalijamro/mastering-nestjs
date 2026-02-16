import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'products',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) {
              return reject(
                new InternalServerErrorException('Cloudinary upload failed'),
              );
            }
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async uploadFileUsingGoogleUrl(url: string): Promise<UploadApiResponse> {
    try {
      const result = await cloudinary.uploader.upload(url, {
        resource_type: 'image',
        folder: 'luxe_google_pfps'
      })
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Cloudinary upload failed');
    }
  }

  async uploadFiles(
    files: Express.Multer.File[],
  ): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
