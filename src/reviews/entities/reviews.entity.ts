import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Media, Product } from '../../products/entities/product.entity';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class ProductReview {
  @ApiProperty({
    description: 'Review ID (UUID).',
    example: '9c1c1d8b-5f2b-4f7a-9e42-1f4e8e2c1c0a',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @IsOptional()
  @Column({ type: 'text' , nullable: true})
  @ApiPropertyOptional({
    description: 'Optional review text.',
    example: 'Great quality and fast shipping.',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  text?: string;

  @IsOptional()
  @Column({ type: 'json', nullable: true })
  @ApiPropertyOptional({
    description: 'Optional media attached to the review.',
    type: () => [Media],
  })
  @IsArray()
  @Type((type) => Media)
  @ValidateNested({ each: true })
  @ArrayMaxSize(5)
  media?: Media[];

  @ApiProperty({
    description: 'Star rating for the product (1-5).',
    example: 4.5,
  })
  @Column('decimal', { precision: 2, scale: 1 })
  @Type((type) => Number)
  @Length(1, 5)
  @IsNumber()
  stars: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
