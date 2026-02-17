import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserWithoutPassword } from 'src/auth/interfaces/user.interface';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Order } from './entities/order.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/utils/roles.decorator';
import { UserRole } from 'src/user/entities/user.entity';

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
  @ApiResponse({ status: 200, description: 'Store orders returned.', type: [Order] })
  getStoreOrders(@Req() req) {
    return this.ordersService.getOrdersForSellerStore(
      req.user as UserWithoutPassword,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by its identifier.' })
  @ApiResponse({ status: 200, description: 'Order returned.', type: Order })
  getOrderById(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.ordersService.getOrderById(id, req.user as UserWithoutPassword);
  }
}
