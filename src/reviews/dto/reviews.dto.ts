import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddReviewDTO {
    @ApiPropertyOptional({
        description: 'Optional review text.',
        example: 'Great quality and fast shipping.',
        minLength: 3,
    })
    @IsOptional()
    @IsString()
    @MinLength(3)
    text: string;

    @ApiProperty({
        description: 'Star rating for the product (1-5).',
        example: 4.5,
        minimum: 1,
        maximum: 5,
    })
    @IsNotEmpty()
    @Type(type => Number)
    @IsNumber()
    stars: number;
}
