import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AddReviewDTO } from './dto/reviews.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileValidationInterceptor } from '../interceptors/file-validation.interceptor';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';

@Controller('reviews')
@ApiTags('Reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':id')
  @ApiOperation({ summary: 'Add a review to a product' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Review payload with optional media.',
    schema: {
      type: 'object',
      required: ['stars'],
      properties: {
        text: {
          type: 'string',
          minLength: 3,
          example: 'Great quality and fast shipping.',
        },
        stars: { type: 'number', minimum: 1, maximum: 5, example: 4.5 },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Review created.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: {
        fileSize: 30 * 1024 * 1024,
      },
    }),
    FileValidationInterceptor,
  )
  addReview(
    @Body() body: AddReviewDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('id', ParseUUIDPipe) productId: string,
    @Req() req,
  ) {
    return this.reviewsService.createReview(
      productId,
      body,
      files,
      req.user as UserWithoutPassword,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'id', description: 'Review ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Review deleted.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  deleteReview(@Param('id', ParseUUIDPipe) reviewId: string, @Req() req) {
    return this.reviewsService.removeReview(
      reviewId,
      req.user as UserWithoutPassword,
    );
  }

  @Get('check')
  isUserEligbleToReview(
    @Query('id', ParseUUIDPipe) id: string,
    @Req() req,
  ): Promise<Boolean> {
    return this.reviewsService.checkIfUserBoughtProduct(req.user as UserWithoutPassword, id);
  }
}
