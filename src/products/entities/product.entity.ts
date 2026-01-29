import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductReview } from '../../reviews/entities/reviews.entity';
import { Tag } from '../../tags/entities/tags.entity';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, IsUrl, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum MediaType {
  video = 'video',
  image = 'image',
}

export class Media {
  @IsEnum(MediaType)
  type: MediaType;

  @IsUrl()
  url: string;

  @IsString()
  cloudinaryPublicId: string;
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
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  media: Media[];

  @OneToMany((type) => ProductReview, (review) => review.product, {
    eager: true,
    cascade: true,
  })
  reviews: ProductReview[];

  @ManyToMany((type) => Tag, (tag) => tag.products, {
    eager: true
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
}
