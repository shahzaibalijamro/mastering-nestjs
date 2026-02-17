import { Store } from 'src/store/entities/store.entity';
import { ContactInformation } from 'src/contact-information/entities/contact-information.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ProfilePicture, signUpMethod, UserRole } from 'src/user/entities/user.entity';

export interface UserWithoutPassword {
  id: string;
  googleId?: string;
  profilePicture: ProfilePicture;
  method: signUpMethod;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  tokenVersion: number;
  store?: Store;
  contactInformation?: ContactInformation[];
  orders?: Order[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPayload {
  sub: string;
  username: string;
  tokenVersion: number;
}

export enum PasswordResetCalledFrom {
  PROFILE = 'PROFILE',
  LOGIN = 'LOGIN'
}