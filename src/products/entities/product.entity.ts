import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductReview } from '../../reviews/entities/reviews.entity';
import { Tag } from '../../tags/entities/tags.entity';
import { Store } from '../../store/entities/store.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MediaType {
  video = 'video',
  image = 'image',
}

export interface Media {
  type: MediaType;
  url: string;
  cloudinaryPublicId: string;
}

@Entity()
export class Product {
  @ApiProperty({
    description: 'Product ID (UUID).',
    example: '0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Human-readable product name.',
    example: 'Canvas Sneakers',
    minLength: 3,
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Product description.',
    example: 'Lightweight everyday sneakers with breathable canvas.',
    minLength: 10,
  })
  @Column({ type: 'text', select: false })
  description: string;

  @ApiProperty({
    description: 'Unit price in the store currency.',
    example: 79.99,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    description: 'Media assets attached to the product.'
  })
  @Column('json')
  media: Media[];

  @ApiProperty({
    description: 'Total users who have favorited this product.',
    example: 27,
    default: 0,
  })
  favoritesCount?: number;

  @ApiPropertyOptional({
    description:
      'Whether the currently authenticated user has favorited this product.',
    example: true,
  })
  isFavorited?: boolean;

  @OneToMany((type) => ProductReview, (review) => review.product, {
    eager: true,
    cascade: true,
  })
  reviews: ProductReview[];

  @ManyToMany((type) => Tag, (tag) => tag.products, {
    eager: true,
    onDelete: 'CASCADE'
  })
  @JoinTable({
    name: 'product_tags',
    joinColumn: {
      name: 'productId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];

  @ManyToOne((type) => Store, (store) => store.products, {
    onDelete: 'CASCADE'
  })
  store: Store;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
