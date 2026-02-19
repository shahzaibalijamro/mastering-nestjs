import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { TagsModule } from '../tags/tags.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ReviewsModule } from '../reviews/reviews.module';
import { Store } from '../store/entities/store.entity';
import { Favorite } from '../favorites/entities/favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Store, Favorite]),
    CloudinaryModule,
    TagsModule,
    ReviewsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CloudinaryService],
  exports: [ProductsService],
})
export class ProductsModule {}
