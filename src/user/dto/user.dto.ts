import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

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
}

export class UpdatePasswordDTO {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^()\-+=]).{8,}$/, {
    message:
      'Password must be at least 8 characters with one uppercase, one lowercase, one number, and one special character',
  })
  newPassword: string;
}
