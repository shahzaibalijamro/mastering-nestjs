import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Media, Product } from '../Entities/product.entity';
import {
  CreateProductDTORaw,
  UpdateProductDTORaw,
  UpdateProductMediaDTO,
} from '../DTOs/product.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
    @Body() body: CreateProductDTORaw,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const { name, description, price } = body;
    const UploadedFiles: UploadApiResponse[] =
      await this.cloudinaryService.uploadFiles(files);
    const media: Media[] = formatCloudinaryMediaFiles(UploadedFiles);
    return this.productsService.addProduct({
      name,
      description,
      price,
      media,
    });
  }

  @Patch(':id')
  updateProduct(
    @Body() body: UpdateProductDTORaw,
    @Param('id', ParseUUIDPipe) id: string
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
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    const file = files?.length > 0 ? files[0] : undefined;
    return this.productsService.updateProductMedia(id, body, file);
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
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    if (files?.length === 0) throw new BadRequestException('No new files recieved!');
    return this.productsService.addProductMedia(id, files);
  }

  @Delete(':id/media')
  deleteProductMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('ids') cloudinaryPublicIds: Array<string>
  ) {
    if (cloudinaryPublicIds?.length === 0) throw new BadRequestException('No cloudinaryPublicIds recieved!')
    return this.productsService.deleteProductMedia(id, cloudinaryPublicIds);
  }
}
