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

enum MediaType {
  video = 'video',
  image = 'image',
}

export interface Media {
  type: MediaType;
  url: string;
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('json')
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
