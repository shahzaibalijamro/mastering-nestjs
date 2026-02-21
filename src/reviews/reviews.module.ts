import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductReview } from './entities/reviews.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { TagsModule } from '../tags/tags.module';
import { Product } from '../products/entities/product.entity';
import { OrdersModule } from 'src/orders/orders.module';
import { Order } from 'src/orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductReview, Product, Order]),
    CloudinaryModule,
    TagsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService]
})
export class ReviewsModule {}
