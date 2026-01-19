import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Media, Product } from './product.entity';
import { IsArray, IsNumber, IsOptional, IsString, Length, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@Entity()
export class ProductReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column({ type: 'text' })
  @IsString()
  @MinLength(3)
  text: string;

  @Column({type: 'json'})
  @IsOptional()
  @IsArray()
  @Type(type => Media)
  @ValidateNested({each: true})
  media: Media[];

  @Column()
  @Length(1, 5)
  @Type(type => Number)
  @IsNumber()
  stars: number;
}
