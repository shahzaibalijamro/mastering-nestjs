import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderItemStatus } from '../entities/order-item.entity';

export class GetStoreOrdersQueryDto {
  @ApiPropertyOptional({
    description: 'Optional filter to return only store order items by status.',
    enum: OrderItemStatus,
    example: OrderItemStatus.PACKING,
  })
  @IsOptional()
  @IsEnum(OrderItemStatus)
  itemStatus?: OrderItemStatus;
}
