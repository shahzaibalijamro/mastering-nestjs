import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';

@Entity()
@Index(['cartId', 'productId'], { unique: true })
export class CartItem {
  @ApiProperty({
    description: 'Unique identifier for the cart item.',
    example: '0b258f66-b88f-43d1-8cc8-95f8ce6f8e49',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items, {
    onDelete: 'CASCADE',
    eager: false,
  })
  cart: Cart;

  @ApiProperty({
    description: 'Identifier of the cart that owns this item.',
    example: '2b76a5a2-7805-4f4f-b78d-fd7fdd37b41f',
  })
  @Column('uuid')
  cartId: string;

  @ManyToOne(() => Product, {
    onDelete: 'CASCADE',
    eager: false,
  })
  product: Product;

  @ApiProperty({
    description: 'Identifier of the product in the cart.',
    example: '0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c',
  })
  @Column('uuid')
  productId: string;

  @ApiProperty({
    description: 'Quantity selected for this product.',
    example: 2,
    minimum: 1,
  })
  @Column('int', { default: 1 })
  quantity: number;

  @ApiProperty({ description: 'Timestamp when the cart item was created.' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the cart item was last updated.' })
  @UpdateDateColumn()
  updatedAt: Date;
}
