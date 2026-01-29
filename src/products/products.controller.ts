import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import {
  CreateProductDTO,
  UpdateProductDTORaw,
  UpdateProductMediaDTO,
} from './dto/products.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileValidationInterceptor } from '../interceptors/file-validation.interceptor';

@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService
  ) {}

  @Get()
  getProducts(): Promise<Product[]> {
    return this.productsService.getProducts();
  }

  @Get(':id')
  getProductById(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
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
    @Body() body: CreateProductDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.productsService.addProduct(body, files);
  }

  @Patch(':id')
  updateProduct(
    @Body() body: UpdateProductDTORaw,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.updateProduct(id, body);
  }

  @Delete(':id')
  deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Patch(':id/media')
  @UseInterceptors(
    FilesInterceptor('files', 1, {
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
    FileValidationInterceptor,
  )
  updateProductMedia(
    @Body() body: UpdateProductMediaDTO,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (files?.length === 0) throw new BadRequestException('No file recieved!');
    return this.productsService.updateProductMedia(id, body, files[0]);
  }

  @Post(':id/media')
  @UseInterceptors(
    FilesInterceptor('files', 9, {
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
    FileValidationInterceptor,
  )
  addProductMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (files?.length === 0)
      throw new BadRequestException('No new files recieved!');
    return this.productsService.addProductMedia(id, files);
  }

  @Delete(':id/media')
  deleteProductMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('ids') cloudinaryPublicIds: Array<string>,
  ) {
    if (cloudinaryPublicIds?.length === 0)
      throw new BadRequestException('No cloudinaryPublicIds recieved!');
    return this.productsService.deleteProductMedia(id, cloudinaryPublicIds);
  }
}
