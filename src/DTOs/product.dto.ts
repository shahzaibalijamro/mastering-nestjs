import { Type } from 'class-transformer';
import {
    IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Media } from '../Entities/product.entity';

export class CreateProductDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  description: string;

  @Type((type) => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type((type) => Media)
  // media: Media[];
}

export class UpdateProductDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;
}
