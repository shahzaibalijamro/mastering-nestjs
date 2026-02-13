import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @Length(3, 40)
  username?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role?: UserRole;
}
