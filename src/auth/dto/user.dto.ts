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
import { UserRole } from '../../user/entities/user.entity';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty({
    description: 'Unique username (lowercased).',
    example: 'jane_doe',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @Length(3, 25)
  username: string;

  @ApiProperty({
    description: 'User email address.',
    example: 'jane@example.com',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Full name for display.',
    example: 'Jane Doe',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 25)
  name: string;

  @ApiProperty({
    description:
      'Password with at least 8 chars, one uppercase, one lowercase, one number, one special character.',
    example: 'Str0ng#Pass1',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^()\-+=]).{8,}$/, {
    message:
      'Password must be at least 8 characters with one uppercase, one lowercase, one number, and one special character',
  })
  password: string;
}

export class CreateGoogleUserDTO {
  @ApiProperty({
    description: 'Unique username (lowercased).',
    example: 'jane_doe',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @Length(3, 25)
  username: string;

  @ApiProperty({
    description: 'User email address.',
    example: 'jane@example.com',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Full name for display.',
    example: 'Jane Doe',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 25)
  name: string;

  @ApiProperty({
    description: 'Google Id',
    example: '113083211950648160355',
    minLength: 3,
  })
  @IsNotEmpty()
  googleId: string;
}

export class ValidateUserDTO {
  @ApiProperty({
    description: 'Username or email.',
    example: 'jane@example.com',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  usernameOrEmail: string;

  @ApiProperty({
    description:
      'Password with at least 8 chars, one uppercase, one lowercase, one number, one special character.',
    example: 'Str0ng#Pass1',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^()\-+=]).{8,}$/, {
    message:
      'Password must be at least 8 characters with one uppercase, one lowercase, one number, and one special character',
  })
  password: string;
}
