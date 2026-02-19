import { UnsupportedMediaTypeException } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import { Media, MediaType } from '../products/entities/product.entity';

export const formatCloudinaryMediaFiles = (
  UploadedFiles: UploadApiResponse[],
): Media[] => {
  const media: Media[] = UploadedFiles.map((file) => {
    const validFileType = isValidResourceType(file.resource_type);
    if (!validFileType) {
      throw new UnsupportedMediaTypeException(
        'Only Images or Videos are supported!',
      );
    }
    return {
      type: file.resource_type as MediaType,
      cloudinaryPublicId: file.public_id,
      url: file.secure_url,
    };
  });
  return media;
};

export const isValidResourceType = (resource_type: string): boolean => {
  return resource_type === 'image' || resource_type === 'video';
};
