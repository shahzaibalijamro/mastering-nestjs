import { Store } from "src/store/entities/store.entity";
import { UserRole } from "src/user/entities/user.entity";

export interface UserWithoutPassword {
  id: string;

  username: string;

  email: string;

  name: string;

  role: UserRole;

  store: Store;

  createdAt: Date;

  updatedAt: Date;
}

export interface TokenPayload {
  sub: string;
  username: string;
}
