import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    description: 'Product identifier to add to the authenticated user cart.',
    example: '0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c',
  })
  @IsUUID(4)
  productId: string;

  @ApiPropertyOptional({
    description: 'Quantity of product to add. Defaults to 1 when omitted.',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  quantity?: number;
}
