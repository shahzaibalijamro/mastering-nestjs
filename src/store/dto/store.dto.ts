import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import type { UserWithoutPassword } from 'src/auth/interfaces/user.interface';

export class CreateStoreDTO {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  idCardNumber: string;

  @IsNotEmpty()
  owner: UserWithoutPassword;
}

export class UpdateStoreDTO {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  idCardNumber?: string;
}