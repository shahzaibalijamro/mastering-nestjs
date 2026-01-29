import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Media, Product } from '../../products/entities/product.entity';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, Length, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@Entity()
export class ProductReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @IsOptional()
  @Column({ type: 'text' })
  @IsString()
  @MinLength(3)
  text?: string;

  @IsOptional()
  @Column({type: 'json'})
  @IsArray()
  @Type(type => Media)
  @ValidateNested({each: true})
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  media?: Media[];

  @Column()
  @Length(1, 5)
  @Type(type => Number)
  @IsNumber()
  stars: number;
}
