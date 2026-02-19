import { ApiProperty } from '@nestjs/swagger';
import { Media } from '../../products/entities/product.entity';

export class CartProductDto {
  @ApiProperty({
    description: 'Product identifier.',
    example: '0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c',
  })
  id: string;

  @ApiProperty({
    description: 'Display name of the product.',
    example: 'Canvas Sneakers',
  })
  name: string;

  @ApiProperty({
    description: 'Current product unit price.',
    example: 79.99,
  })
  price: number;

  @ApiProperty({
    description: 'Product media files.',
  })
  media: Media[];
}

export class CartItemSummaryDto {
  @ApiProperty({
    description: 'Cart item identifier.',
    example: '0b258f66-b88f-43d1-8cc8-95f8ce6f8e49',
  })
  id: string;

  @ApiProperty({
    description: 'Product identifier in this line item.',
    example: '0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c',
  })
  productId: string;

  @ApiProperty({
    description: 'Quantity selected in cart.',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Current unit price at read time.',
    example: 79.99,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Line item subtotal (unitPrice * quantity).',
    example: 159.98,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Current product details used by cart UI.',
    type: () => CartProductDto,
  })
  product: CartProductDto;
}

export class CartOrderItemDto {
  @ApiProperty({
    description: 'Product identifier for order creation payload.',
    example: '0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c',
  })
  productId: string;

  @ApiProperty({
    description: 'Quantity for order creation payload.',
    example: 2,
  })
  quantity: number;
}

export class CartSummaryDto {
  @ApiProperty({
    description: 'Cart identifier.',
    example: '2b76a5a2-7805-4f4f-b78d-fd7fdd37b41f',
  })
  id: string;

  @ApiProperty({
    description: 'Current cart line items.',
    type: () => [CartItemSummaryDto],
  })
  items: CartItemSummaryDto[];

  @ApiProperty({
    description: 'How many distinct products are in the cart.',
    example: 2,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Total quantity across all cart items.',
    example: 3,
  })
  totalQuantity: number;

  @ApiProperty({
    description: 'Computed total amount using current product prices.',
    example: 239.97,
  })
  totalAmount: number;

  @ApiProperty({
    description:
      'Direct payload source for order creation API items array.',
    type: () => [CartOrderItemDto],
  })
  orderItems: CartOrderItemDto[];

  @ApiProperty({
    description: 'Timestamp when the cart was created.',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the cart was last updated.',
  })
  updatedAt: Date;
}
