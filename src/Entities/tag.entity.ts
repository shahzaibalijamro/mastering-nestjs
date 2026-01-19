import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { IsString, MinLength } from 'class-validator';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsString()
  @MinLength(3)
  name: string;

  @ManyToMany((type) => Product, (product) => product.tags)
  products: Product[];
}
