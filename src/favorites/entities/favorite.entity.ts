import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['userId', 'productId'], { unique: true })
@Index(['userId'])
@Index(['productId'])
export class Favorite {
  @ApiProperty({
    description: 'Unique identifier for the favorite record.',
    example: '7486df0d-ac2f-47d7-a9e4-8a2ac09dd83a',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'Identifier of the user who favorited the product.',
    example: '8c5d7a8f-6fb4-4df5-b6f1-93d2f6333a21',
  })
  @Column('uuid')
  userId: string;

  @ManyToOne(() => Product, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty({
    description: 'Identifier of the favorited product.',
    example: '0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c',
  })
  @Column('uuid')
  productId: string;

  @ApiProperty({
    description: 'Timestamp when the favorite record was created.',
  })
  @CreateDateColumn()
  createdAt: Date;
}
