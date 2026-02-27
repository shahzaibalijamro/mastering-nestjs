import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Tag {
  @ApiProperty({
    description: 'Tag ID (UUID).',
    example: 'a2f1b2c3-4d5e-6f70-8a9b-0c1d2e3f4a5b',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(type => User, (user) => user.addedTags, {
    onDelete: 'SET NULL'
  })
  user: User;

  @Column('uuid', {nullable: true})
  userId: string;

  @ApiProperty({
    description: 'Tag name.',
    example: 'Footwear',
    minLength: 3,
  })
  @Column({ unique: true })
  name: string;

  @ManyToMany((type) => Product, (product) => product.tags, {
    eager: false,
  })
  products: Product[];

  @CreateDateColumn({select:false})
  createdAt: Date;

  @UpdateDateColumn({select:false})
  updatedAt: Date;
}
