import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

const PHONE_REGEX = /^\+?[0-9()\-\s.]{7,20}$/;

export class RegisterSellerDto {
  @IsString()
  @MinLength(3)
  storeName: string;

  @IsString()
  @MinLength(10)
  storeAddress: string;

  @IsString()
  @Matches(PHONE_REGEX)
  phoneNumber: string;

  @IsString()
  @MinLength(8)
  idCardNumber: string;

  @IsString()
  @IsNotEmpty()
  stripePaymentMethodId: string;
}
