import { IsNotEmpty, IsString, Length } from 'class-validator';
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
