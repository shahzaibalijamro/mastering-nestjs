import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { TokenPayload, UserWithoutPassword } from 'src/auth/interfaces/user.interface';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserDTO } from './dto/user.dto';

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

    @Patch()
    updateUser(
        @Req() req,
        @Body() body: UpdateUserDTO
    ): Promise<UserWithoutPassword> {
        return this.userService.updateUser(body, req.user as UserWithoutPassword);
    }
}
