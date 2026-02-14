import { Store } from 'src/store/entities/store.entity';
import { signUpMethod, UserRole } from 'src/user/entities/user.entity';

export interface UserWithoutPassword {
  id: string;
  googleId?: string;
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
