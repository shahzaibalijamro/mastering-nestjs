import { ApiProperty } from '@nestjs/swagger';

export class ProductFavoriteStatusDto {
  @ApiProperty({
    description: 'Product identifier.',
    example: '0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c',
  })
  productId: string;

  @ApiProperty({
    description:
      'Whether the currently authenticated user has favorited this product.',
    example: true,
  })
  isFavorited: boolean;

  @ApiProperty({
    description: 'How many users have favorited this product.',
    example: 27,
  })
  favoritesCount: number;
}
