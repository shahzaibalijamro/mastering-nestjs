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
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import {
  CreateProductDTO,
  deleteMultipleProductsDTO,
  UpdateProductDTORaw,
  UpdateProductMediaDTO,
} from './dto/products.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileValidationInterceptor } from '../interceptors/file-validation.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Public } from 'src/utils/public.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  getProducts(): Promise<Product[]> {
    return this.productsService.getProducts();
  }

  @Public()
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
    @Req() req,
  ) {
    return this.productsService.addProduct(body, files, req.user);
  }

  @Patch(':id')
  updateProduct(
    @Body() body: UpdateProductDTORaw,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ) {
    return this.productsService.updateProduct(id, body, req.user);
  }

  @Delete(':id')
  deleteProduct(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.productsService.deleteProduct(id, req.user);
  }

  @Delete()
  deleteMultipleProducts(@Body() body: deleteMultipleProductsDTO, @Req() req) {
    return this.productsService.deleteMultipleProducts(body, req.user);
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
    @Req() req
  ) {
    if (files?.length === 0) throw new BadRequestException('No file recieved!');
    return this.productsService.updateProductMedia(id, body, files[0], req.user);
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
    @Req() req
  ) {
    if (files?.length === 0)
      throw new BadRequestException('No new files recieved!');
    return this.productsService.addProductMedia(id, files, req.user);
  }

  @Delete(':id/media')
  deleteProductMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('ids') cloudinaryPublicIds: Array<string>,
    @Req() req
  ) {
    if (cloudinaryPublicIds?.length === 0)
      throw new BadRequestException('No cloudinaryPublicIds recieved!');
    return this.productsService.deleteProductMedia(id, cloudinaryPublicIds, req.user);
  }
}
