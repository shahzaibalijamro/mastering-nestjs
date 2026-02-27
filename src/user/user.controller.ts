import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  Res,
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
import { CookieOptions, Response } from 'express';

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
  async deleteUser(
    @Req() req,
    @Res({passthrough: true}) res: Response
  ):Promise<void> {
    await this.userService.deleteUser(req.user as UserWithoutPassword);
    res.clearCookie('jwt', this.userService.cookieConfigurations() as CookieOptions)
    return;
  }
}
