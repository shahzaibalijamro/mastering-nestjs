import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class AddReviewDTO {
    @IsOptional()
    @IsString()
    @MinLength(3)
    text: string;

    @IsNotEmpty()
    @Type(type => Number)
    @IsNumber()
    stars: number;
}