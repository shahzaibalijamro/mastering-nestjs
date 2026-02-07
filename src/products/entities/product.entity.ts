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
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUrl,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Store } from 'src/store/entities/store.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum MediaType {
  video = 'video',
  image = 'image',
}

export class Media {
  @ApiProperty({
    description: 'Media type.',
    enum: MediaType,
    example: MediaType.image,
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({
    description: 'Public URL for the media asset.',
    example: 'https://res.cloudinary.com/demo/image/upload/v123/product.jpg',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Cloudinary public ID for managing the asset.',
    example: 'products/abc123',
  })
  @IsString()
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
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Product description.',
    example: 'Lightweight everyday sneakers with breathable canvas.',
    minLength: 10,
  })
  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    description: 'Unit price in the store currency.',
    example: 79.99,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  @Type((type) => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Media assets attached to the product.',
    type: () => [Media],
  })
  @Column('json')
  @IsArray()
  @ValidateNested({ each: true })
  @Type((type) => Media)
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  media: Media[];

  @OneToMany((type) => ProductReview, (review) => review.product, {
    eager: true,
    cascade: true,
  })
  reviews: ProductReview[];

  @ManyToMany((type) => Tag, (tag) => tag.products, {
    eager: true,
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
    eager: true,
  })
  store: Store;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
