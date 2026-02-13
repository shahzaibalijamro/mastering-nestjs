import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Tag {
  @ApiProperty({
    description: 'Tag ID (UUID).',
    example: 'a2f1b2c3-4d5e-6f70-8a9b-0c1d2e3f4a5b',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Tag name.',
    example: 'Footwear',
    minLength: 3,
  })
  @Column({ unique: true })
  name: string;

  @ManyToMany((type) => Product, (product) => product.tags)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
