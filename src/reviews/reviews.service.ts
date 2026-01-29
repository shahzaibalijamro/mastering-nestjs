import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductReview } from './entities/reviews.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AddReviewDTO } from './dto/reviews.dto';
import { UploadApiResponse } from 'cloudinary';
import { formatCloudinaryMediaFiles } from 'src/utils/utils';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { ConfirmationMsg } from 'src/utils/confirmation.interface';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ProductReview)
    private readonly reviewRepository: Repository<ProductReview>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly productsService: ProductsService
  ) {}

  async createReview(productId: string, body: AddReviewDTO, files: Array<Express.Multer.File>): Promise<ConfirmationMsg> {
    const { stars, text } = body;
    const product: Product = await this.productsService.getProductById(productId);
    const review = this.reviewRepository.create({
        text,
        stars,
        product
    })
    if (files?.length > 0) {
      const UploadedFiles: UploadApiResponse[] =
        await this.cloudinaryService.uploadFiles(files);
      review.media = formatCloudinaryMediaFiles(UploadedFiles);
    }
    await this.reviewRepository.save(review);
    return {
        id: review.id,
        message: 'Review Added!'
    }
  }

  async getReviewById(id: string): Promise<ProductReview> {
    const review = await this.reviewRepository.findOne({
        where: {
            id,
        }
    })
    if (!review) {
        throw new NotFoundException('Review Not Found!')
    }
    return review;
  }

  async removeReview(id: string): Promise<ConfirmationMsg> {
    const review = await this.getReviewById(id);
    const reviewId = review.id;
    if (review.media && review.media.length > 0) {
        await Promise.all(review.media.map(media => this.cloudinaryService.deleteFile(media.cloudinaryPublicId)))
    }
    await this.reviewRepository.remove(review);
    return {
        id: reviewId,
        message: 'Review deleted!'
    }
  }
}
