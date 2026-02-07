import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

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
        username: true
      }
    });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return user;
  }
}
