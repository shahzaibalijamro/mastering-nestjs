import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { ConfirmationMsg, Token } from '../utils/confirmation.interface';
import { CreateUserDTO, SignInDTO } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,

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

  

  async signIn(body: SignInDTO): Promise<Token> {
    const { usernameOrEmail, password } = body;
    const user = await this.userService.getUserByUsernameOrEmail(usernameOrEmail);
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials!');
    }
    const payload = { sub: user.id, username: user.username };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
