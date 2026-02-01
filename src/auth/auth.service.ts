import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { ConfirmationMsg } from 'src/utils/confirmation.interface';
import { CreateUserDTO, SignInDTO } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(body: CreateUserDTO): Promise<ConfirmationMsg> {
    const { password, role } = body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await this.userRepository.save({
      ...body,
      password: hashedPassword,
      role: role ? role : UserRole.USER,
    });
    return {
      id: user.id,
      message: 'User created!',
    };
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (!user) {
        throw new NotFoundException('User not found!')
    }
    return user;
  }

  async signIn(body: SignInDTO) {
    const { usernameOrEmail, password } = body;
  }
}
