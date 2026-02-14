import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class sendEmailDTO {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    to: string;

    @IsNotEmpty()
    @IsString()
    from: string;

    @IsNotEmpty()
    @IsString()
    subject: string;

     @IsNotEmpty()
    @IsString()
    html: string;
}