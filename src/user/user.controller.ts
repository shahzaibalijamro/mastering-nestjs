import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type {
  UserWithoutPassword,
} from '../auth/interfaces/user.interface';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDTO } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle({long: true, short: false})
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUser(@Req() req): Promise<User> {
    return req.user;
  }

  @Patch()
  @UseInterceptors(
    FileInterceptor('picture', {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  updateUser(
    @Req() req,
    @Body() body: UpdateUserDTO,
    @UploadedFile() profilePicture: Express.Multer.File,
  ): Promise<UserWithoutPassword> {
    return this.userService.updateUser(
      body,
      req.user as UserWithoutPassword,
      profilePicture,
    );
  }

  @Delete()
  deleteUser(
    @Req() req
  ):Promise<void> {
    return this.userService.deleteUser(req.user as UserWithoutPassword);
  }
}
