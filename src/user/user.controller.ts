import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { TokenPayload } from 'src/auth/interfaces/user.interface';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}


    @Get()
    getUser(
        @Req() req
    ): Promise<User>{
        return req.user;
    }
}
