import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const PHONE_REGEX = /^\+?[0-9()\-\s.]{7,20}$/;

export class CreateContactInformationDto {
  @ApiProperty({
    description: 'Full name of the recipient for deliveries.',
    example: 'Alex Johnson',
    minLength: 3,
    maxLength: 120,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName: string;

  @ApiProperty({
    description: 'Phone number where the recipient can be reached.',
    example: '+15555551234',
  })
  @IsString()
  @Matches(PHONE_REGEX)
  phoneNumber: string;

  @ApiProperty({
    description: 'Primary address line (street and number).',
    example: '123 Market Street',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'Secondary address line (apartment, suite, etc.).',
    example: 'Apartment 12B',
  })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({
    description: 'City for the delivery address.',
    example: 'San Francisco',
    minLength: 2,
    maxLength: 120,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city: string;

  @ApiProperty({
    description: 'State or region.',
    example: 'CA',
    minLength: 2,
    maxLength: 120,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  state: string;

  @ApiProperty({
    description: 'Postal or ZIP code.',
    example: '94105',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  postalCode: string;

  @ApiProperty({
    description: 'Country for the delivery address.',
    example: 'United States',
    minLength: 2,
    maxLength: 120,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  country: string;
}
