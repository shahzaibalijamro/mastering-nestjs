import { Store } from 'src/store/entities/store.entity';
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
  store?: Store;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPayload {
  sub: string;
  username: string;
}