import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
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
import { UpdatePasswordDTO } from 'src/user/dto/user.dto';
import { MailService } from 'src/mail/mail.service';
import { randomBytes } from 'node:crypto';
import { ResetToken } from './entities/resetToken.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(ResetToken) private readonly resetTokenRepository: Repository<ResetToken>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
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
    const existing = await this.userRepository.findOneBy({
      googleId: body.googleId,
    });
    const { profilePicture, ...remaining } = body;
    if (!existing) {
      const user = this.userRepository.create({
        ...remaining,
        role: UserRole.USER,
        method: signUpMethod.GOOGLE,
      });
      if (profilePicture) {
        user.profilePicture = {
          url: profilePicture,
        };
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

  async updatePassword(
    body: UpdatePasswordDTO,
    { id }: UserWithoutPassword,
  ): Promise<void> {
    const { oldPassword, newPassword } = body;
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      select: {
        password: true,
        method: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    if (!user.password || user.method === signUpMethod.GOOGLE) {
      throw new NotAcceptableException(
        'Cannot change the password of a google account!',
      );
    }
    const doPasswordsMatch = await bcrypt.compare(oldPassword, user.password);
    if (!doPasswordsMatch) {
      throw new ForbiddenException('Invalid credentials!');
    }
    await this.userRepository.update(id, {
      password: await bcrypt.hash(newPassword, 10),
    });
    return;
  }

  async sendResetPasswordLink(
    user: UserWithoutPassword,
  ): Promise<ConfirmationMsg> {
    const { email, id, method, googleId } = user;
    if (googleId && method === signUpMethod.GOOGLE) {
      throw new ConflictException('This user has signed up via google!');
    }
    const token = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);
    const resetToken = this.resetTokenRepository.create({
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      userId: id,
      token: hashedToken
    })
    await this.resetTokenRepository.save(resetToken);
    await this.mailService.sendEmail({
      to: email,
      from: 'jamroshahzaibali69@gmail.com',
      html: '<h1>Hello world!</h1>',
      subject: 'Testing',
    });
    return {
      id,
      message: 'Reset password email sent!',
    };
  }
}
