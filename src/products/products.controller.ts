import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from '../Entities/product.entity';
import { CreateProductDTO } from '../DTOs/product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { uploadMediaToCloudinary } from '../Interceptors/upload-to-cloudinary.interceptor';
import { multerConfig } from '../Configs/multer.config';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  getProducts(): Promise<Product[]> {
    return this.productsService.getProducts();
  }

  @Get(':id')
  getProductById(@Param('id') id: string): Promise<Product> {
    return this.productsService.getProductById(id);
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, multerConfig),
    uploadMediaToCloudinary,
  )
  addProduct(
    @Body() body: CreateProductDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): string {
    // console.log(files);
    return 'abc';
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    this.productsService.deleteProduct(id);
    return { message: 'Product deleted' };
  }
}
