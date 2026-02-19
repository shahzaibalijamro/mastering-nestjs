import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductReview } from './entities/reviews.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { AddReviewDTO } from './dto/reviews.dto';
import { UploadApiResponse } from 'cloudinary';
import { formatCloudinaryMediaFiles } from '../temp_utils/utils';
import { Product } from '../products/entities/product.entity';
import { ConfirmationMsg } from '../temp_utils/confirmation.interface';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ProductReview)
    private readonly reviewRepository: Repository<ProductReview>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  private async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createReview(
    productId: string,
    body: AddReviewDTO,
    files: Array<Express.Multer.File>,
    user: UserWithoutPassword,
  ): Promise<ConfirmationMsg> {
    const { stars, text } = body;
    const product: Product = await this.getProductById(productId);
    if (product.store.owner.id === user.id) {
      throw new ForbiddenException(
        'Sellers cannot leave a review on their own products!',
      );
    }
    const review = this.reviewRepository.create({
      text,
      stars,
      product,
      user,
    });
    if (files?.length > 0) {
      const UploadedFiles: UploadApiResponse[] =
        await this.cloudinaryService.uploadFiles(files);
      review.media = formatCloudinaryMediaFiles(UploadedFiles);
    }
    await this.reviewRepository.save(review);
    return {
      id: review.id,
      message: 'Review Added!',
    };
  }

  async getReviewById(id: string): Promise<ProductReview> {
    const review = await this.reviewRepository.findOne({
      where: {
        id,
      },
    });
    if (!review) {
      throw new NotFoundException('Review Not Found!');
    }
    return review;
  }

  async removeReview(
    id: string,
    user: UserWithoutPassword,
  ): Promise<ConfirmationMsg> {
    const review = await this.getReviewById(id);
    if (review.user.id !== user.id) {
      throw new ForbiddenException(
        'Only users who leave the review can delete them!',
      );
    }
    const reviewId = review.id;
    if (review.media && review.media.length > 0) {
      await Promise.all(
        review.media.map((media) =>
          this.cloudinaryService.deleteFile(media.cloudinaryPublicId),
        ),
      );
    }
    await this.reviewRepository.remove(review);
    return {
      id: reviewId,
      message: 'Review deleted!',
    };
  }

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    const product = await this.getProductById(productId);
    const productReviews = await this.reviewRepository.findBy({
      product: {
        id: productId,
      },
    });
    return productReviews;
  }
}
