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
import { Media } from '../entities/product.entity';

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
}

export class UpdateProductDTO {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;

  @IsOptional()
  @Type((type) => Number)
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type((type) => Media)
  media?: Media[];
}

export class UpdateProductDTORaw {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;

  @IsOptional()
  @Type((type) => Number)
  @IsNumber()
  @IsPositive()
  price?: number;
}

export class UpdateProductMediaDTO {
  @IsOptional()
  @IsString()
  cloudinaryPublicId?: string;

  @IsOptional()
  @Type((type) => Media)
  media?: Media;
}

export class DeleteProductMediaDTO {
  @IsNotEmpty()
  @IsString()
  cloudinaryPublicId?: string;
}
