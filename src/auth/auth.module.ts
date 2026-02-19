import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JWTStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { MailModule } from '../mail/mail.module';
import { ResetToken } from './entities/resetToken.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, ResetToken]), UserModule, MailModule, CloudinaryModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JWTStrategy, GoogleStrategy],
  exports: [AuthService]
})
export class AuthModule {}
