import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/user.dto';
import { ConfirmationMsg } from 'src/utils/confirmation.interface';

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
}
