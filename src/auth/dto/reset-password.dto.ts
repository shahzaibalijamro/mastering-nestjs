import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class ResetPasswordWithTokenDTO {
  @ApiProperty({
    description: 'Unhashed reset token received via email query params.',
    example:
      '6f58c2d2f7a8c6b2d2a7e2b4e707df7b6cb8d7bb4df91d5f0ee7d6d24e8af0ad',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'User email received via email query params.',
    example:
      'abcd@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'New password with at least 8 chars, one uppercase, one lowercase, one number, and one special character.',
    example: 'N3wStrong#Pass2',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^()\-+=]).{8,}$/, {
    message:
      'Password must be at least 8 characters with one uppercase, one lowercase, one number, and one special character',
  })
  newPassword: string;


}
