import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @ApiProperty({
    description: 'Unique identifier for the order item.',
    example: 'f7560c93-11c9-4fa7-8f6d-8b45c63a5684',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Product identifier at the time of ordering.',
    example: '0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c',
  })
  @Column('uuid')
  productId: string;

  @ApiProperty({
    description: 'Name of the product at the time of ordering.',
    example: 'Canvas Sneakers',
  })
  @Column({ length: 255 })
  productName: string;

  @ApiProperty({
    description: 'Unit price of the product when the order was placed.',
    example: 79.99,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @ApiProperty({
    description: 'Number of units ordered for this product.',
    example: 2,
  })
  @Column('int')
  quantity: number;

  @ApiProperty({
    description: 'Computed subtotal for this line item (unitPrice * quantity).',
    example: 159.98,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @ManyToOne(() => Product, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  product?: Product;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  order: Order;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
