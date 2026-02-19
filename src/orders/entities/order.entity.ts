import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { User } from '../../user/entities/user.entity';

export enum OrderStatus {
  PAID = 'PAID',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

export interface OrderContactDetails {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export class OrderContactDetailsSchema implements OrderContactDetails {
  @ApiProperty({ example: 'Alex Johnson' })
  fullName: string;

  @ApiProperty({ example: '+15555551234' })
  phoneNumber: string;

  @ApiProperty({ example: '123 Market Street' })
  addressLine1: string;

  @ApiProperty({ example: 'Apartment 12B', required: false })
  addressLine2?: string;

  @ApiProperty({ example: 'San Francisco' })
  city: string;

  @ApiProperty({ example: 'CA' })
  state: string;

  @ApiProperty({ example: '94105' })
  postalCode: string;

  @ApiProperty({ example: 'United States' })
  country: string;
}

@Entity()
export class Order {
  @ApiProperty({
    description: 'Unique identifier for the order.',
    example: '8c5d7a8f-6fb4-4df5-b6f1-93d2f6333a21',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Total amount charged for the order.',
    example: 159.98,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty({
    description:
      'Total delivery fee charged for this order based on distinct stores.',
    example: 20.0,
  })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @ApiProperty({
    description: 'Currency used for the order total.',
    example: 'usd',
  })
  @Column({ length: 10 })
  currency: string;

  @ApiProperty({
    description: 'Stripe payment intent identifier associated with this order.',
    example: 'pi_3PZvwW2eZvKYlo2C0qYQm99b',
  })
  @Column({ length: 120 })
  stripePaymentIntentId: string;

  @ApiProperty({
    description: 'Status of the order payment lifecycle.',
    enum: OrderStatus,
  })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PAID })
  status: OrderStatus;

  @ApiProperty({
    description: 'Snapshot of the delivery contact details used for this order.',
    type: () => OrderContactDetailsSchema,
  })
  @Column('jsonb')
  contactDetails: OrderContactDetails;

  @ApiProperty({
    description: 'Orders are placed by authenticated users.',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'CASCADE',
    eager: false,
  })
  user: User;

  @ApiProperty({
    description: 'Id of the user object to whom this order belongs.',
    example: '8c5d7a8f-6fb4-4df5-b6f1-93d2f6333a21',
  })
  @Column('uuid')
  userId: string;

  @ApiProperty({
    description: 'Line items included in the order.',
    type: () => [OrderItem],
  })
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: false,
  })
  items: OrderItem[];

  @ApiProperty({
    description: 'Timestamp when the order was created.',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the order was last updated.',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
