import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TagsModule } from 'src/tags/tags.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { Store } from 'src/store/entities/store.entity';
import { Favorite } from 'src/favorites/entities/favorite.entity';

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
