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
  Query,
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
  getProductsFilterDTO,
  PaginatedProductsDTO,
  UpdateProductDTORaw,
  UpdateProductMediaDTO,
} from './dto/products.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileValidationInterceptor } from '../interceptors/file-validation.interceptor';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../utils/public.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import { Roles } from '../utils/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle({long: true, short: false})
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Products')
@ApiBearerAuth()
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // get all products
  @Public()
  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiResponse({
    status: 200,
    description: 'List of products.',
    type: PaginatedProductsDTO,
  })
  getProducts(
    @Query() queryParams: getProductsFilterDTO,
  ): Promise<PaginatedProductsDTO> {
    return this.productsService.getProducts(queryParams);
  }

  // get each user's products
  @Roles(UserRole.SELLER)
  @Get('me')
  getUserProducts(@Req() req): Promise<Product[]> {
    return this.productsService.getProductsByUser(
      req.user as UserWithoutPassword,
    );
  }


  // get a product by Id
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Product found.', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  getProductById(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.getProductById(id);
  }


  // create product
  @Roles(UserRole.SELLER)
  @Post()
  @ApiOperation({ summary: 'Create a product with media' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product data plus media files.',
    schema: {
      type: 'object',
      required: ['name', 'description', 'price'],
      properties: {
        name: { type: 'string', minLength: 3, example: 'Canvas Sneakers' },
        description: {
          type: 'string',
          minLength: 3,
          example: 'Lightweight everyday sneakers with breathable canvas.',
        },
        price: { type: 'number', example: 79.99 },
        tagIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          example: ['baf1b2d4-6a2b-4e9f-9f0f-0a6d73d5f2e1'],
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Product created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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

  // update product
  @Roles(UserRole.SELLER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Product updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  updateProduct(
    @Body() body: UpdateProductDTORaw,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ) {
    return this.productsService.updateProduct(id, body, req.user);
  }

  // delete a product
  @Roles(UserRole.SELLER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Product deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  deleteProduct(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.productsService.deleteProduct(id, req.user);
  }

  // Delete multiple products
  @Roles(UserRole.SELLER)
  @Delete()
  @ApiOperation({ summary: 'Delete multiple products' })
  @ApiBody({ type: deleteMultipleProductsDTO })
  @ApiResponse({ status: 200, description: 'Products deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  deleteMultipleProducts(@Body() body: deleteMultipleProductsDTO, @Req() req) {
    return this.productsService.deleteMultipleProducts(body, req.user);
  }

  // Replace a product media item
  @Roles(UserRole.SELLER)
  @Patch(':id/media')
  @ApiOperation({ summary: 'Replace a product media item' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Media replacement payload with a single file.',
    schema: {
      type: 'object',
      properties: {
        cloudinaryPublicId: { type: 'string', example: 'products/abc123' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Product media updated.' })
  @ApiResponse({ status: 400, description: 'No file received.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
    @Req() req,
  ) {
    if (files?.length === 0) throw new BadRequestException('No file recieved!');
    return this.productsService.updateProductMedia(
      id,
      body,
      files[0],
      req.user,
    );
  }

  // Add media to a product
  @Roles(UserRole.SELLER)
  @Post(':id/media')
  @ApiOperation({ summary: 'Add media to a product' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload one or more media files.',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Product media added.' })
  @ApiResponse({ status: 400, description: 'No new files received.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
    @Req() req,
  ) {
    if (files?.length === 0)
      throw new BadRequestException('No new files recieved!');
    return this.productsService.addProductMedia(id, files, req.user);
  }

  // Delete media from a product
  @Roles(UserRole.SELLER)
  @Delete(':id/media')
  @ApiOperation({ summary: 'Delete media from a product' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          example: ['products/abc123'],
        },
      },
      required: ['ids'],
    },
  })
  @ApiResponse({ status: 200, description: 'Product media deleted.' })
  @ApiResponse({ status: 400, description: 'No cloudinaryPublicIds received.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  deleteProductMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('ids') cloudinaryPublicIds: Array<string>,
    @Req() req,
  ) {
    if (cloudinaryPublicIds?.length === 0)
      throw new BadRequestException('No cloudinaryPublicIds recieved!');
    return this.productsService.deleteProductMedia(
      id,
      cloudinaryPublicIds,
      req.user,
    );
  }
}
