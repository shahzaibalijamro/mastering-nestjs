import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductReview } from './entities/reviews.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductsService } from 'src/products/products.service';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductReview, Product])
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, CloudinaryService, ProductsService]
})
export class ReviewsModule {}
