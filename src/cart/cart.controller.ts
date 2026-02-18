import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserWithoutPassword } from 'src/auth/interfaces/user.interface';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartSummaryDto } from './dto/cart-summary.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartService } from './cart.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated user cart.' })
  @ApiResponse({ status: 200, description: 'Cart returned.', type: CartSummaryDto })
  getMyCart(@Req() req) {
    return this.cartService.getCartForUser(req.user as UserWithoutPassword);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a product to the authenticated user cart.' })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({ status: 201, description: 'Cart updated.', type: CartSummaryDto })
  addItemToCart(@Req() req, @Body() body: AddCartItemDto) {
    return this.cartService.addItem(req.user as UserWithoutPassword, body);
  }

  @Patch('items/:productId')
  @ApiOperation({
    summary: 'Set a new quantity for a product in the authenticated user cart.',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product identifier (UUID).',
  })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Cart updated.', type: CartSummaryDto })
  updateCartItemQuantity(
    @Req() req,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(
      req.user as UserWithoutPassword,
      productId,
      body,
    );
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove a product from the authenticated user cart.' })
  @ApiParam({
    name: 'productId',
    description: 'Product identifier (UUID).',
  })
  @ApiResponse({ status: 200, description: 'Cart updated.', type: CartSummaryDto })
  removeCartItem(@Req() req, @Param('productId', ParseUUIDPipe) productId: string) {
    return this.cartService.removeItem(req.user as UserWithoutPassword, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove all items from the authenticated user cart.' })
  @ApiResponse({ status: 200, description: 'Cart cleared.', type: CartSummaryDto })
  clearCart(@Req() req) {
    return this.cartService.clearCart(req.user as UserWithoutPassword);
  }
}
