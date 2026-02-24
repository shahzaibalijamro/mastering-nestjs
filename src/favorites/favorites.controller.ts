import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import { Product } from '../products/entities/product.entity';
import { ConfirmationMsg } from '../utils/confirmation.interface';
import { ProductFavoriteStatusDto } from './dto/product-favorite-status.dto';
import { FavoritesService } from './favorites.service';
import { SkipThrottle } from '@nestjs/throttler';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Favorites')
@SkipThrottle({long: true, short: false})
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'List favorited products for the authenticated user.' })
  @ApiResponse({
    status: 200,
    description: 'Favorite products returned.',
    type: Product,
    isArray: true,
  })
  getMyFavoriteProducts(@Req() req) {
    return this.favoritesService.getFavoriteProducts(
      req.user as UserWithoutPassword,
    );
  }

  @Get('ids')
  @ApiOperation({
    summary: 'List favorited product IDs for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite product IDs returned.',
    type: String,
    isArray: true,
  })
  getMyFavoriteProductIds(@Req() req) {
    return this.favoritesService.getFavoriteProductIds(
      req.user as UserWithoutPassword,
    );
  }

  @Get('status/:productId')
  @ApiOperation({
    summary:
      'Get favorite status for the authenticated user and favorite count for a product.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID (UUID).' })
  @ApiResponse({
    status: 200,
    description: 'Favorite status returned.',
    type: ProductFavoriteStatusDto,
  })
  getFavoriteStatus(
    @Req() req,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.favoritesService.getProductFavoriteStatus(
      req.user as UserWithoutPassword,
      productId,
    );
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add a product to the authenticated user favorites.' })
  @ApiParam({ name: 'productId', description: 'Product ID (UUID).' })
  @ApiResponse({
    status: 201,
    description: 'Product favorited.',
  })
  addProductToFavorites(
    @Req() req,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ConfirmationMsg> {
    return this.favoritesService.addProductToFavorites(
      req.user as UserWithoutPassword,
      productId,
    );
  }

  @Delete(':productId')
  @ApiOperation({
    summary: 'Remove a product from the authenticated user favorites.',
  })
  @ApiParam({ name: 'productId', description: 'Product ID (UUID).' })
  @ApiResponse({
    status: 200,
    description: 'Product removed from favorites.',
  })
  removeProductFromFavorites(
    @Req() req,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ConfirmationMsg> {
    return this.favoritesService.removeProductFromFavorites(
      req.user as UserWithoutPassword,
      productId,
    );
  }
}
