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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDTO {
  @ApiProperty({
    description: 'Human-readable product name.',
    example: 'Canvas Sneakers',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Product description for listing pages and detail view.',
    example: 'Lightweight everyday sneakers with breathable canvas.',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  description: string;

  @ApiProperty({
    description: 'Unit price in the store currency.',
    example: 79.99,
    minimum: 0,
  })
  @Type((type) => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({
    description: 'Tag IDs to associate with the product.',
    example: ['baf1b2d4-6a2b-4e9f-9f0f-0a6d73d5f2e1'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, {each: true})
  tagIds: Array<string>
}

export class UpdateProductDTO {
  @ApiPropertyOptional({
    description: 'Human-readable product name.',
    example: 'Canvas Sneakers',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({
    description: 'Product description for listing pages and detail view.',
    example: 'Lightweight everyday sneakers with breathable canvas.',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;

  @ApiPropertyOptional({
    description: 'Unit price in the store currency.',
    example: 79.99,
    minimum: 0,
  })
  @IsOptional()
  @Type((type) => Number)
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({
    description: 'Full media array for the product.',
    type: () => [Media],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type((type) => Media)
  media?: Media[];

  @ApiPropertyOptional({
    description: 'Tag IDs to associate with the product.',
    example: ['baf1b2d4-6a2b-4e9f-9f0f-0a6d73d5f2e1'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, {each: true})
  tagIds: Array<string>
}

export class UpdateProductDTORaw {
  @ApiPropertyOptional({
    description: 'Human-readable product name.',
    example: 'Canvas Sneakers',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({
    description: 'Product description for listing pages and detail view.',
    example: 'Lightweight everyday sneakers with breathable canvas.',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;

  @ApiPropertyOptional({
    description: 'Unit price in the store currency.',
    example: 79.99,
    minimum: 0,
  })
  @IsOptional()
  @Type((type) => Number)
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({
    description: 'Tag IDs to associate with the product.',
    example: ['baf1b2d4-6a2b-4e9f-9f0f-0a6d73d5f2e1'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, {each: true})
  tagIds: Array<string>
}

export class UpdateProductMediaDTO {
  @ApiPropertyOptional({
    description: 'Cloudinary public ID to replace.',
    example: 'products/abc123',
  })
  @IsOptional()
  @IsString()
  cloudinaryPublicId?: string;

  @ApiPropertyOptional({
    description: 'Existing media metadata.',
    type: () => Media,
  })
  @IsOptional()
  @Type((type) => Media)
  media?: Media;
}

export class DeleteProductMediaDTO {
  @ApiProperty({
    description: 'Cloudinary public ID to delete.',
    example: 'products/abc123',
  })
  @IsNotEmpty()
  @IsString()
  cloudinaryPublicId?: string;
}

export class deleteMultipleProductsDTO {
  @ApiProperty({
    description: 'List of product IDs to delete.',
    example: ['0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(4, {
    each: true
  })
  ids: Array<string>
}
