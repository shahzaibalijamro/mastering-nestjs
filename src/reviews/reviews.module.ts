import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductReview } from './entities/reviews.entity';
import { ProductsModule } from 'src/products/products.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TagsModule } from 'src/tags/tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductReview]),
    ProductsModule,
    CloudinaryModule,
    TagsModule
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService]
})
export class ReviewsModule {}
