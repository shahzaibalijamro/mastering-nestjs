import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
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

  @IsOptional()
  @IsArray()
  @IsUUID(4, {each: true})
  tagIds: Array<string>
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

  @IsOptional()
  @IsArray()
  @IsUUID(4, {each: true})
  tagIds: Array<string>
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

  @IsOptional()
  @IsArray()
  @IsUUID(4, {each: true})
  tagIds: Array<string>
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

export class deleteMultipleProductsDTO {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(4, {
    each: true
  })
  ids: Array<string>
}