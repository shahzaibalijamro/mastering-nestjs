import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { PaymentsModule } from '../payments/payments.module';
import { ContactInformationModule } from '../contact-information/contact-information.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Store } from '../store/entities/store.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, Store]),
    PaymentsModule,
    ContactInformationModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
