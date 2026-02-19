import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Order } from './entities/order.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../utils/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { GetStoreOrdersQueryDto } from './dto/get-store-orders-query.dto';
import { UpdateOrderItemStatusDto } from './dto/update-order-item-status.dto';
import { OrderItem, OrderItemStatus } from './entities/order-item.entity';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create an order for the authenticated user.' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created.', type: Order })
  createOrder(@Req() req, @Body() body: CreateOrderDto) {
    return this.ordersService.createOrder(req.user as UserWithoutPassword, body);
  }

  @Get()
  @ApiOperation({ summary: 'List orders for the authenticated user.' })
  @ApiResponse({ status: 200, description: 'Orders returned.', type: [Order] })
  getOrders(@Req() req) {
    return this.ordersService.getOrdersForUser(req.user as UserWithoutPassword);
  }

  @Get('store')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiOperation({
    summary: "List orders that contain products from the seller's store.",
  })
  @ApiQuery({
    name: 'itemStatus',
    required: false,
    enum: OrderItemStatus,
    description: 'Optional fulfillment status filter for seller order items.',
  })
  @ApiResponse({ status: 200, description: 'Store orders returned.', type: [Order] })
  getStoreOrders(@Req() req, @Query() query: GetStoreOrdersQueryDto) {
    return this.ordersService.getOrdersForSellerStore(
      req.user as UserWithoutPassword,
      query.itemStatus,
    );
  }

  @Patch('store/items/:itemId/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiOperation({
    summary: "Update fulfillment status for an item in the seller's store.",
  })
  @ApiBody({ type: UpdateOrderItemStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Order item status updated.',
    type: OrderItem,
  })
  updateOrderItemStatusForSeller(
    @Req() req,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() body: UpdateOrderItemStatusDto,
  ) {
    return this.ordersService.updateOrderItemStatusForSeller(
      req.user as UserWithoutPassword,
      itemId,
      body,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by its identifier.' })
  @ApiResponse({ status: 200, description: 'Order returned.', type: Order })
  getOrderById(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.ordersService.getOrderById(id, req.user as UserWithoutPassword);
  }
}
