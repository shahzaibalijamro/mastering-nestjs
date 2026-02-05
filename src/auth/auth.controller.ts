import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/user.dto';
import { ConfirmationMsg, Token } from 'src/utils/confirmation.interface';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserWithoutPassword } from './interfaces/user.interface';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('signup')
    signUp(
        @Body() body: CreateUserDTO,
    ): Promise<ConfirmationMsg>{
        return this.authService.createUser(body);
    }

    @Post('signin')
    @UseGuards(LocalAuthGuard)
    signIn(
        @Request() req
    ): Promise<Token> {
        const user:UserWithoutPassword = req.user;
        return this.authService.signIn(user);
    }
}
