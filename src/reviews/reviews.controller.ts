import { Body, Controller, Delete, Param, ParseUUIDPipe, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AddReviewDTO } from './dto/reviews.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileValidationInterceptor } from 'src/interceptors/file-validation.interceptor';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':id')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
        limits: {
            fileSize: 30 * 1024 * 1024
        }
    }),
    FileValidationInterceptor
  )
  addReview(
    @Body() body: AddReviewDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('id', ParseUUIDPipe) productId: string
  ) {
    return this.reviewsService.createReview(productId,body,files);
  }

  @Delete(':id')
  deleteReview(
    @Param('id', ParseUUIDPipe) reviewId: string
  ) {
    return this.reviewsService.removeReview(reviewId);
  }
}
