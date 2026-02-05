import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, SignInDTO } from './dto/user.dto';
import { ConfirmationMsg } from 'src/utils/confirmation.interface';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';

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

    @UseGuards(LocalAuthGuard)
    @Post('signin')
    signIn(
        @Request() req
    ) {
        return req.user;
    }
}
