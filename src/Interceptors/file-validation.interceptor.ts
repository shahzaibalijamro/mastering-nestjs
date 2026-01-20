import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

const MAX_MEDIA_FILES = 10;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]);

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const files: Express.Multer.File[] = req.files || [];
    if (files.length > MAX_MEDIA_FILES) {
      throw new BadRequestException(
        `Products cannot have more than ${MAX_MEDIA_FILES} media files!`,
      );
    }
    console.log(files);
    for (const file of files) {
      const { mimetype, size } = file;
      if (VIDEO_MIME_TYPES.has(mimetype)) {
        if (size > MAX_VIDEO_SIZE) {
          throw new PayloadTooLargeException('Videos must be 50MB or smaller');
        }
        continue;
      }
      if (IMAGE_MIME_TYPES.has(mimetype)) {
        if (size > MAX_IMAGE_SIZE) {
          throw new PayloadTooLargeException('Images must be 10MB or smaller');
        }
        continue;
      }

      // EVERYTHING ELSE = REJECT
      throw new UnsupportedMediaTypeException(
        `Unsupported file type: ${mimetype}`,
      );
    }
    return next.handle();
  }
}
