import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, ValidateUserDTO } from './dto/user.dto';
import { ConfirmationMsg, Token } from '../utils/confirmation.interface';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserWithoutPassword } from './interfaces/user.interface';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { UpdatePasswordDTO } from '../user/dto/user.dto';
import { ResetPasswordEmailDTO, ResetPasswordWithTokenDTO } from './dto/reset-password.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('auth')
@ApiTags('Auth')
@SkipThrottle()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipThrottle({short: true, long: false})
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  signInWithGoogle() {}

  @SkipThrottle({short: true, long: false})
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res) {
    const user = req.user as UserWithoutPassword;
    const { token } = await this.authService.signIn(user);
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/login?token=${token}`;
    return res.redirect(redirectUrl);
  }

  @SkipThrottle({short: true, long: false})
  @Post('signup')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiBody({ type: CreateUserDTO })
  @ApiResponse({
    status: 201,
    description: 'User created.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c' },
        message: { type: 'string', example: 'User created!' },
      },
    },
  })
  signUp(@Body() body: CreateUserDTO): Promise<ConfirmationMsg> {
    return this.authService.createUser(body);
  }

  @SkipThrottle({short: true, long: false})
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Sign in and get a JWT' })
  @ApiBody({ type: ValidateUserDTO })
  @ApiResponse({
    status: 200,
    description: 'JWT token returned.',
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  signIn(@Request() req): Promise<Token> {
    const user: UserWithoutPassword = req.user;
    return this.authService.signIn(user);
  }

  @SkipThrottle({short: false, long: true})
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  verifyUser(
    @Request() req,
  ): Promise<{ token: string; user: UserWithoutPassword }> {
    return this.authService.getNewToken(req.user as UserWithoutPassword);
  }

  @SkipThrottle({short: true, long: false})
  @Patch('update-password')
  @UseGuards(JwtAuthGuard)
  updatePassword(@Req() req, @Body() body: UpdatePasswordDTO): Promise<void> {
    return this.authService.updatePassword(
      body,
      req.user as UserWithoutPassword,
    );
  }

  @SkipThrottle({short: true, long: false})
  @Post('reset-password-email')
  resetPassword(@Body() body: ResetPasswordEmailDTO): Promise<ConfirmationMsg> {
    return this.authService.sendResetPasswordLink(body);
  }

  @SkipThrottle({short: true, long: false})
  @Patch('reset-password')
  @ApiOperation({
    summary:
      'Reset user password by validating bearer token and reset token from email',
  })
  @ApiBody({ type: ResetPasswordWithTokenDTO })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '0f0d50d8-6d14-4e2c-97ad-0ed4e2ea2f2c' },
        message: { type: 'string', example: 'Password reset successful!' },
      },
    },
  })
  resetPasswordWithToken(
    @Body() body: ResetPasswordWithTokenDTO,
  ): Promise<ConfirmationMsg> {
    return this.authService.resetPasswordWithToken(body);
  }
}
