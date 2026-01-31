import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { Transform } from 'class-transformer';

export class CreateUserDTO {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @Length(3, 25)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 25)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^()\-+=]).{8,}$/, {
    message:
      'Password must be at least 8 characters with one uppercase, one lowercase, one number, and one special character',
  })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
}

export class SignInDTO {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  usernameOrEmail: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^()\-+=]).{8,}$/, {
    message:
      'Password must be at least 8 characters with one uppercase, one lowercase, one number, and one special character',
  })
  password: string;
}
