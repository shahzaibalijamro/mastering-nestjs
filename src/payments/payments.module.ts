import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SellersController } from './sellers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { User } from 'src/user/entities/user.entity';
import { Store } from 'src/store/entities/store.entity';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { StoreModule } from 'src/store/store.module';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    StoreModule,
    TypeOrmModule.forFeature([Payment, User, Store]),
  ],
  controllers: [PaymentsController, SellersController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
