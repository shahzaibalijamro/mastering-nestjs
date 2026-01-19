import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Media, Product } from './product.entity';
import { Length, Min } from 'class-validator';

@Entity()
export class ProductReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column({
    type: 'text',
  })
  text: string;

  @Column({
    type: 'json',
  })
  media: Media[];

  @Column()
  @Length(1, 5)
  stars: number;
}
