import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload, UserWithoutPassword } from '../interfaces/user.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: TokenPayload): Promise<UserWithoutPassword> {
    const user = await this.userService.getUserByUsernameOrEmail(
      payload.username,
    );
    console.log(user);
    console.log(payload);
    
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Invalid Token!');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
