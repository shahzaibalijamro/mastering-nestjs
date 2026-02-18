import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderItemStatus } from '../entities/order-item.entity';

export class UpdateOrderItemStatusDto {
  @ApiProperty({
    description: 'New fulfillment status for the selected order item.',
    enum: OrderItemStatus,
    example: OrderItemStatus.SHIPPED,
  })
  @IsEnum(OrderItemStatus)
  status: OrderItemStatus;
}
