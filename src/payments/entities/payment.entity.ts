import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';

export enum PaymentPurpose {
  SELLER_REGISTRATION = 'SELLER_REGISTRATION',
  ORDER = 'ORDER',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  stripePaymentIntentId: string;

  @Column('int')
  amount: number;

  @Column({ length: 10 })
  currency: string;

  @Column({ length: 30 })
  status: string;

  @Column({ type: 'enum', enum: PaymentPurpose, default: PaymentPurpose.SELLER_REGISTRATION })
  purpose: PaymentPurpose;

  @ManyToOne(() => Order, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  order?: Order;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
