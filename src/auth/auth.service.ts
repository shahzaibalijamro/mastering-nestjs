import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { signUpMethod, User, UserRole } from '../user/entities/user.entity';
import { ConfirmationMsg, Token } from '../utils/confirmation.interface';
import {
  CreateGoogleUserDTO,
  CreateUserDTO,
  ValidateUserDTO,
} from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import {
  PasswordResetCalledFrom,
  TokenPayload,
  UserWithoutPassword,
} from './interfaces/user.interface';
import { UpdatePasswordDTO } from '../user/dto/user.dto';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'node:crypto';
import { ResetToken } from './entities/resetToken.entity';
import {
  ResetPasswordEmailDTO,
  ResetPasswordWithTokenDTO,
} from './dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(ResetToken)
    private readonly resetTokenRepository: Repository<ResetToken>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createUser(body: CreateUserDTO): Promise<ConfirmationMsg> {
    try {
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
    } catch (error) {
      if (error?.code && error.code === '23505') {
        throw new ConflictException(
          'An account with this username or email already exists!',
        );
      }
      throw new InternalServerErrorException();
    }
  }

  async createGoogleUser(body: CreateGoogleUserDTO): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: {
        googleId: body.googleId,
      },
      select: {
        password: true,
        createdAt: true,
        email: true,
        id: true,
        googleId: true,
        method: true,
        profilePicture: true,
        name: true,
        role: true,
        store: true,
        updatedAt: true,
        username: true,
        tokenVersion: true,
      },
    });
    const { profilePicture, ...remaining } = body;
    if (!existing) {
      const user = this.userRepository.create({
        ...remaining,
        role: UserRole.USER,
        method: signUpMethod.GOOGLE,
      });
      if (profilePicture) {
        const result =
          await this.cloudinaryService.uploadFileUsingGoogleUrl(profilePicture);
        user.profilePicture = {
          url: result.url,
          cloudinaryPublicId: result.public_id,
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
      await this.userService.getUserByUsernameOrEmail(usernameOrEmail.toLowerCase());
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
      tokenVersion: user.tokenVersion,
    };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async getNewToken(
    user: UserWithoutPassword,
  ): Promise<{ token: string; user }> {
    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
      tokenVersion: user.tokenVersion,
    };
    const { tokenVersion, ...userFiltered } = user;
    return {
      token: await this.jwtService.signAsync(payload),
      user: userFiltered,
    };
  }

  cookieConfigurations() {
    const NODE_ENV = this.configService.get<string>('NODE_ENV');
    if (!NODE_ENV) {
      throw new InternalServerErrorException();
    }
    console.log('production' === NODE_ENV);
    return {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    }
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
    const password = await bcrypt.hash(newPassword, 10);
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        password,
        tokenVersion: () => 'tokenVersion + 1',
      })
      .where('id = :id', { id })
      .execute();
    return;
  }

  async sendResetPasswordLink(
    body: ResetPasswordEmailDTO,
  ): Promise<ConfirmationMsg> {
    const { email, from } = body;
    console.log(email, from);
    

    const user = await this.userService.getUserByUsernameOrEmail(email);

    const { id, method, googleId, name } = user;
    if (googleId && method === signUpMethod.GOOGLE) {
      throw new ConflictException('This user has signed up via google!');
    }

    // Revoke older active tokens so only the latest link can be used.
    await this.resetTokenRepository.update(
      { userId: id, isUsed: false },
      { isUsed: true },
    );

    const token = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);
    const resetToken = this.resetTokenRepository.create({
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      userId: id,
      token: hashedToken,
    });
    await this.resetTokenRepository.save(resetToken);
    const resetLink = this.buildResetPasswordLink(token, user.email, from);

    await this.mailService.sendEmail({
      to: user.email,
      from:
        this.configService.get<string>('EMAIL_USER') ??
        'jamroshahzaibali69@gmail.com',
      html: this.buildResetPasswordEmailTemplate({
        userName: name,
        userEmail: email,
        resetLink,
      }),
      subject: 'Reset your Luxe Ecommerce Store password',
    });
    return {
      id: user.email,
      message: 'Reset password email sent!',
    };
  }

  async resetPasswordWithToken(
    body: ResetPasswordWithTokenDTO,
  ): Promise<ConfirmationMsg> {
    const { token, newPassword, email } = body;
    const user = await this.userService.getUserByUsernameOrEmail(email);

    const activeToken: ResetToken | null =
      await this.resetTokenRepository.findOne({
        where: {
          userId: user.id,
          isUsed: false,
          expiresAt: MoreThan(new Date()),
        },
        order: {
          expiresAt: 'DESC',
        },
      });

    if (!activeToken) {
      throw new UnauthorizedException('Reset token is invalid or expired!');
    }

    const isMatch = await bcrypt.compare(token, activeToken.token);
    if (!isMatch) {
      throw new UnauthorizedException('Reset token is invalid or expired!');
    }
    await this.resetTokenRepository.update(
      { userId: user.id, isUsed: false },
      { isUsed: true },
    );

    const password = await bcrypt.hash(newPassword, 10);

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        password,
        tokenVersion: () => 'tokenVersion + 1',
      })
      .where('id = :id', { id: user.id })
      .execute();

    return {
      id: user.id,
      message: 'Password reset successful!',
    };
  }

  private buildResetPasswordLink(
    token: string,
    email: string,
    from: PasswordResetCalledFrom,
  ): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('Frontend url not found!');
    }
    const resetPath = '/auth/reset-password';
    return `${frontendUrl}${resetPath}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&from=${encodeURIComponent(from)}`;
  }

  private buildResetPasswordEmailTemplate({
    userName,
    userEmail,
    resetLink,
  }: {
    userName: string;
    userEmail: string;
    resetLink: string;
  }): string {
    const safeName = this.escapeHtml(userName);
    const safeEmail = this.escapeHtml(userEmail);
    const safeLink = this.escapeHtml(resetLink);
    const requestedAt = new Date().toUTCString();

    return `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f3eee8;font-family:Arial,Helvetica,sans-serif;color:#1a1612;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3eee8;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e9ded2;">
            <tr>
              <td style="padding:32px 32px 30px;background:linear-gradient(120deg,#111111 0%,#252525 55%,#3a2c1d 100%);">
                <p style="margin:0;font-size:12px;letter-spacing:0.34em;text-transform:uppercase;color:#d8c8b2;">Luxe Ecommerce Store</p>
                <h1 style="margin:14px 0 0;font-size:34px;line-height:1.2;font-family:Georgia,'Times New Roman',serif;color:#ffffff;">Password Reset</h1>
                <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#f0e9e2;">Secure your account and get back to premium shopping in one click.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px 18px;">
                <p style="margin:0;font-size:16px;line-height:1.7;color:#2a2622;">Hi <strong>${safeName}</strong>,</p>
                <p style="margin:12px 0 0;font-size:15px;line-height:1.8;color:#4e4740;">We received a request to reset the password for your Luxe Ecommerce Store account.</p>
                <p style="margin:8px 0 0;font-size:15px;line-height:1.8;color:#4e4740;">For your security, this reset link will expire in <strong>30 minutes</strong>.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 10px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="border-radius:10px;background:#1a1612;">
                      <a href="${safeLink}" style="display:inline-block;padding:14px 24px;font-size:14px;font-weight:700;letter-spacing:0.02em;color:#ffffff;text-decoration:none;">Reset Password</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 32px 12px;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#7b736b;">If the button does not work, copy and paste this URL into your browser:</p>
                <p style="margin:8px 0 0;font-size:12px;line-height:1.7;word-break:break-all;color:#7b736b;">${safeLink}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 32px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf6f1;border:1px solid #e9ded2;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#8c7b69;">Request Details</p>
                      <p style="margin:0;font-size:13px;line-height:1.7;color:#4e4740;"><strong>Account:</strong> ${safeEmail}</p>
                      <p style="margin:0;font-size:13px;line-height:1.7;color:#4e4740;"><strong>Requested At (UTC):</strong> ${requestedAt}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 30px;">
                <p style="margin:0;font-size:12px;line-height:1.8;color:#8a8279;">If you did not request this, you can safely ignore this email.</p>
                <p style="margin:10px 0 0;font-size:12px;line-height:1.8;color:#8a8279;">Need help? Contact us at help@luxe.store</p>
              </td>
            </tr>
          </table>
          <p style="margin:14px 0 0;font-size:11px;color:#9b8f82;">&copy; ${new Date().getFullYear()} Luxe Ecommerce Store. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  }

  private escapeHtml(value: string | undefined): string {
    return (value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
