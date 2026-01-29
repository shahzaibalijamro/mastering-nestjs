import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class addTagDTO {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    name: string
}