import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class addTagDTO {
    @ApiProperty({
        description: 'Tag display name.',
        example: 'Footwear',
        minLength: 3,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    name: string
}
