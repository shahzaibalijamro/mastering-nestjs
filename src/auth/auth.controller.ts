import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, ValidateUserDTO } from './dto/user.dto';
import { ConfirmationMsg, Token } from 'src/utils/confirmation.interface';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserWithoutPassword } from './interfaces/user.interface';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from 'src/user/entities/user.entity';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { UpdatePasswordDTO } from 'src/user/dto/user.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  signInWithGoogle() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res) {
    const user = req.user as UserWithoutPassword;
    const { token } = await this.authService.signIn(user);
    const redirectUrl = `http://localhost:3001/auth/login?token=${token}`;
    return res.redirect(redirectUrl);
  }

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

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  verifyUser(
    @Request() req,
  ): Promise<{ token: string; user: UserWithoutPassword }> {
    return this.authService.getNewToken(req.user as UserWithoutPassword);
  }

  @Patch('update-password')
  @UseGuards(JwtAuthGuard)
  updatePassword(@Req() req, @Body() body: UpdatePasswordDTO): Promise<void> {
    return this.authService.updatePassword(
      body,
      req.user as UserWithoutPassword,
    );
  }

  @Get('reset-password-email')
  @UseGuards(JwtAuthGuard)
  resetPassword(@Req() req): Promise<ConfirmationMsg> {
    return this.authService.sendResetPasswordLink(
      req.user as UserWithoutPassword,
    );
  }
}
