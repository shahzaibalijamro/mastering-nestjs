import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../Entities/product.entity';
import { ProductReview } from '../Entities/review.entity';
import { Tag } from '../Entities/tag.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductReview, Tag])
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CloudinaryService],
})
export class ProductsModule {}
