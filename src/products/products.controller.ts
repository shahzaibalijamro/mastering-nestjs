import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Media, Product } from '../Entities/product.entity';
import { CreateProductDTORaw, UpdateProductDTORaw } from '../DTOs/product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileValidationInterceptor } from '../Interceptors/file-validation.interceptor';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { formatCloudinaryMediaFiles } from '../Utils/utils';
import { UploadApiResponse } from 'cloudinary';

@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private cloudinaryService: CloudinaryService,
  ) {}

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
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
    FileValidationInterceptor,
  )
  async addProduct(
    @Body() body: CreateProductDTORaw,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const {name, description, price} = body;
    const UploadedFiles: UploadApiResponse[] = await this.cloudinaryService.uploadFiles(files);
    const media: Media[] = formatCloudinaryMediaFiles(UploadedFiles)
    return await this.productsService.addProduct({name, description, price, media})
  }

  @Patch(':id')
  async updateProduct(
    @Body() body: UpdateProductDTORaw,
    @Param('id') id: string
  ) {
    return await this.productsService.updateProduct(id, body);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    this.productsService.deleteProduct(id);
    return { message: 'Product deleted' };
  }
}
