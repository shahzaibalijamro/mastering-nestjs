import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order, OrderContactDetails, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserWithoutPassword } from 'src/auth/interfaces/user.interface';
import { ContactInformationService } from 'src/contact-information/contact-information.service';
import { PaymentsService } from 'src/payments/payments.service';
import { PaymentPurpose } from 'src/payments/entities/payment.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class OrdersService {
  private readonly currency = 'usd';

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly paymentsService: PaymentsService,
    private readonly contactInformationService: ContactInformationService,
  ) {}

  async createOrder(
    user: UserWithoutPassword,
    body: CreateOrderDto,
  ): Promise<Order> {
    const contact = await this.contactInformationService.getByIdForUser(
      body.contactInformationId,
      user,
    );

    const quantities = new Map<string, number>();
    for (const item of body.items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
    }

    const productIds = Array.from(quantities.keys());
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Products not found: ${missing.join(', ')}`,
      );
    }

    const orderItems: OrderItem[] = [];
    let totalAmountInCents = 0;

    for (const product of products) {
      const quantity = quantities.get(product.id) ?? 0;
      if (quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1.');
      }

      const unitPrice = Number(product.price);
      const unitPriceInCents = Math.round(unitPrice * 100);
      const subtotalInCents = unitPriceInCents * quantity;
      totalAmountInCents += subtotalInCents;

      const orderItem = this.orderItemRepository.create({
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity,
        subtotal: Number((subtotalInCents / 100).toFixed(2)),
        product,
      });
      orderItems.push(orderItem);
    }

    if (totalAmountInCents <= 0) {
      throw new BadRequestException('Order total must be greater than zero.');
    }

    const paymentIntent = await this.paymentsService.chargeOrder({
      amountInCents: totalAmountInCents,
      currency: this.currency,
      paymentMethodId: body.stripePaymentMethodId,
      user,
    });

    const contactDetails: OrderContactDetails = {
      fullName: contact.fullName,
      phoneNumber: contact.phoneNumber,
      addressLine1: contact.addressLine1,
      addressLine2: contact.addressLine2,
      city: contact.city,
      state: contact.state,
      postalCode: contact.postalCode,
      country: contact.country,
    };

    const order = this.orderRepository.create({
      totalAmount: Number((totalAmountInCents / 100).toFixed(2)),
      currency: this.currency,
      stripePaymentIntentId: paymentIntent.id,
      status: OrderStatus.PAID,
      contactDetails,
      user: { id: user.id } as User,
      items: orderItems,
    });

    order.items.forEach((item) => {
      item.order = order;
    });

    const savedOrder = await this.orderRepository.save(order);

    await this.paymentsService.recordPayment({
      paymentIntent,
      user,
      order: savedOrder,
      purpose: PaymentPurpose.ORDER,
    });

    return savedOrder;
  }

  async getOrdersForUser(user: UserWithoutPassword): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: string, user: UserWithoutPassword): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: {
        id,
        user: { id: user.id },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
