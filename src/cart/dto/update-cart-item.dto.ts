import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'New quantity for the product in the cart.',
    example: 3,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;
}
