import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart {
  @ApiProperty({
    description: 'Unique identifier for the cart.',
    example: '2b76a5a2-7805-4f4f-b78d-fd7fdd37b41f',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'Identifier of the user who owns this cart.',
    example: '8c5d7a8f-6fb4-4df5-b6f1-93d2f6333a21',
  })
  @Column('uuid', { unique: true })
  userId: string;

  @ApiProperty({
    description: 'Line items currently in the cart.',
    type: () => [CartItem],
  })
  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
    eager: false,
  })
  items: CartItem[];

  @ApiProperty({ description: 'Timestamp when the cart was created.' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the cart was last updated.' })
  @UpdateDateColumn()
  updatedAt: Date;
}
