import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { signUpMethod, User, UserRole } from '../user/entities/user.entity';
import { ConfirmationMsg, Token } from '../utils/confirmation.interface';
import {
  CreateGoogleUserDTO,
  CreateUserDTO,
  ValidateUserDTO,
} from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { TokenPayload, UserWithoutPassword } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async createUser(body: CreateUserDTO): Promise<ConfirmationMsg> {
    const user = this.userRepository.create({
      ...body,
      role: UserRole.USER,
      method: signUpMethod.FORM,
    });
    await this.userRepository.save(user);
    return {
      id: user.id,
      message: 'User created!',
    };
  }

  async createGoogleUser(body: CreateGoogleUserDTO): Promise<User> {
    const existing = await this.userRepository.findOneBy({ googleId: body.googleId });
    const { profilePicture, ...remaining } = body;
    if (!existing) {
      const user = this.userRepository.create({
        ...remaining,
        role: UserRole.USER,
        method: signUpMethod.GOOGLE,
      });
      if (profilePicture) {
        user.profilePicture = {
          url: profilePicture
        }
      }
      await this.userRepository.save(user);
      return user;
    }
    return existing;
  }

  async validateUser(
    body: ValidateUserDTO,
  ): Promise<UserWithoutPassword | null> {
    const { usernameOrEmail, password } = body;
    const user =
      await this.userService.getUserByUsernameOrEmail(usernameOrEmail);
    console.log(user, 'USER');

    if (user.password && bcrypt.compareSync(password, user.password)) {
      const { password, ...result } = user;
      return result;
    } else {
      return null;
    }
  }

  async signIn(user: UserWithoutPassword): Promise<Token> {
    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
    };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async getNewToken(
    user: UserWithoutPassword,
  ): Promise<{ token: string; user: UserWithoutPassword }> {
    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
    };
    return {
      token: await this.jwtService.signAsync(payload),
      user,
    };
  }
}
