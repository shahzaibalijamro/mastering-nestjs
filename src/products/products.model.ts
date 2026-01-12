import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class Product{
    constructor (
        public readonly id: string,
        public title: string,
        public description: string,
        public price: number
    ) {}
    
}

export class CreateProductDTO{
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;
}

export class UpdateProductDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;
}