import { InternalServerErrorException, Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TagsModule } from './tags/tags.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { StoreModule } from './store/store.module';
import { JwtModule } from '@nestjs/jwt';
import { PaymentsModule } from './payments/payments.module';
import { MailModule } from './mail/mail.module';
import { ContactInformationModule } from './contact-information/contact-information.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          url: config.get<string>('DB_URL'),
          synchronize: true,
          autoLoadEntities: true,
        };
      },
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const normalLimit = Number(config.get<string>('SHORT_LIMIT'));
        const normalLimitDuration = Number(
          config.get<string>('SHORT_LIMIT_DURATION'),
        );
        const authLimit = Number(config.get<string>('LONG_LIMIT'));
        const authLimitDuration = Number(
          config.get<string>('LONG_LIMIT_DURATION'),
        );
        if (
          !normalLimit ||
          !normalLimitDuration ||
          !authLimit ||
          !authLimitDuration
        ) {
          throw new InternalServerErrorException(
            'Missing throttle configuration',
          );
        }
        return {
          throttlers: [
            {
              name: 'short',
              limit: normalLimit,
              ttl: normalLimitDuration,
            },
            {
              name: 'long',
              limit: authLimit,
              ttl: authLimitDuration,
            },
          ],
        };
      },
    }),
    ProductsModule,
    CloudinaryModule,
    ReviewsModule,
    TagsModule,
    AuthModule,
    UserModule,
    StoreModule,
    PaymentsModule,
    MailModule,
    ContactInformationModule,
    OrdersModule,
    CartModule,
    FavoritesModule,
  ],
  controllers: [],
  exports: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule {}
