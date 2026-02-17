import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemInputDto {
  @ApiProperty({
    description: 'Identifier of the product being ordered.',
    example: '0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c',
  })
  @IsUUID(4)
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product to purchase.',
    example: 2,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Stripe PaymentMethod identifier obtained from Stripe.js.',
    example: 'pm_1PZxXa2eZvKYlo2CMyFpignm',
  })
  @IsString()
  @IsNotEmpty()
  stripePaymentMethodId: string;

  @ApiProperty({
    description: 'Contact information identifier associated with the user.',
    example: 'b27fca1f-93f6-4bb8-894f-6c2c9a3b8c4e',
  })
  @IsUUID(4)
  contactInformationId: string;

  @ApiProperty({
    description: 'Line items being purchased in this order.',
    type: () => [OrderItemInputDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];
}
