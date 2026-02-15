import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (conf: ConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: conf.get<string>('EMAIL_USER'),
            pass: conf.get<string>('EMAIL_PASS'),
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailerModule,MailService]
})
export class MailModule {}
