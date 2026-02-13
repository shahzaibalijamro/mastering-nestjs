import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserWithoutPassword } from 'src/auth/interfaces/user.interface';
import { ConfirmationMsg } from 'src/utils/confirmation.interface';
import { UpdateUserDTO } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      select: {
        password: true,
        createdAt: true,
        email: true,
        id: true,
        name: true,
        role: true,
        store: true,
        updatedAt: true,
        username: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return user;
  }

  async getUserById(id: string): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User does not exist! ');
    }
    return user;
  }

  async updateUser(
    body: UpdateUserDTO,
    userObj: UserWithoutPassword,
  ): Promise<UserWithoutPassword> {
    const user = await this.getUserById(userObj.id);
    const { name, role, username } = body;
    if (name) {
      user.name = name;
    }
    if (role) {
      user.role = role;
    }
    if (username) {
      const exist = await this.userRepository.findOneBy({ username });
      if (exist) {
        throw new ConflictException('A user with this username already exists');
      }
      user.username = username;
    }
    await this.userRepository.save(user);
    return user
  }
}
