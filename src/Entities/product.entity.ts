import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductReview } from './review.entity';
import { Tag } from './tag.entity';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, IsUrl, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

enum MediaType {
  video = 'video',
  image = 'image',
}

export class Media {
  @IsEnum(MediaType)
  type: MediaType;

  @IsUrl()
  url: string;
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @Type(type => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @Column('json')
  @IsArray()
  @ValidateNested({ each: true })
  @Type(type => Media)
  media: Media[];

  @OneToMany((type) => ProductReview, (review) => review.product, {
    eager: true,
    cascade: true,
  })
  reviews: ProductReview[];

  @ManyToMany((type) => Tag, (tag) => tag.products)
  @JoinTable({
    name: 'product_tags', // Custom table name
    joinColumn: {
      name: 'productId', // Foreign key to Product
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId', // Foreign key to Tag
      referencedColumnName: 'id',
    },
  })
  tags: Tag[];
}
