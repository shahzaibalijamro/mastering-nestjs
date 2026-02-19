import { Store } from '../../store/entities/store.entity';
import { ContactInformation } from '../../contact-information/entities/contact-information.entity';
import { Order } from '../../orders/entities/order.entity';
import { ProfilePicture, signUpMethod, UserRole } from '../../user/entities/user.entity';

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