import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {
  Order,
  OrderContactDetails,
  OrderStatus,
} from './entities/order.entity';
import { OrderItem, OrderItemStatus } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import { ContactInformationService } from '../contact-information/contact-information.service';
import { PaymentsService } from '../payments/payments.service';
import { PaymentPurpose } from '../payments/entities/payment.entity';
import { User } from '../user/entities/user.entity';
import { Store } from '../store/entities/store.entity';
import { UpdateOrderItemStatusDto } from './dto/update-order-item-status.dto';

@Injectable()
export class OrdersService {
  private readonly currency = 'usd';
  private readonly deliveryFeePerStoreInCents = 1000;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
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
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.store', 'store')
      .select(['product.id', 'product.name', 'product.price', 'store.id'])
      .where('product.id IN (:...productIds)', { productIds })
      .getMany();

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Products not found: ${missing.join(', ')}`);
    }

    const orderItems: OrderItem[] = [];
    let totalAmountInCents = 0;
    const storeIds = new Set<string>();

    for (const product of products) {
      const quantity = quantities.get(product.id) ?? 0;
      if (quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1.');
      }
      if (!product.store?.id) {
        throw new BadRequestException(
          `Product ${product.id} is missing a valid store.`,
        );
      }

      const unitPrice = Number(product.price);
      const unitPriceInCents = Math.round(unitPrice * 100);
      const subtotalInCents = unitPriceInCents * quantity;
      totalAmountInCents += subtotalInCents;
      storeIds.add(product.store.id);

      const orderItem = this.orderItemRepository.create({
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity,
        subtotal: Number((subtotalInCents / 100).toFixed(2)),
        storeId: product.store.id,
        status: OrderItemStatus.PACKING,
        product,
      });
      orderItems.push(orderItem);
    }

    const deliveryFeeInCents = storeIds.size * this.deliveryFeePerStoreInCents;
    totalAmountInCents += deliveryFeeInCents;

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
      deliveryFee: Number((deliveryFeeInCents / 100).toFixed(2)),
      currency: this.currency,
      stripePaymentIntentId: paymentIntent.id,
      status: OrderStatus.PAID,
      contactDetails,
      user: { id: user.id } as User,
      items: orderItems,
    });

    // order.items.forEach((item) => {
    //   item.orderId = order.id;
    //   item.order = { id: order.id } as Order;
    // });

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
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      relations: {
        items: true,
      },
    });
  }

  async checkIfUserBoughtProduct(
    user: UserWithoutPassword,
    productId: string,
  ): Promise<Boolean> {
    const product = await this.orderRepository.find({
      where: {
        userId: user.id,
        items: {
          productId,
        },
      },
      relations: {
        items: true,
      },
    });
    console.log(product);
    if (product) {
      return true;
    }
    return false;
  }

  async getOrdersForSellerStore(
    user: UserWithoutPassword,
    itemStatus?: OrderItemStatus,
  ): Promise<Order[]> {
    const store = await this.getStoreForSeller(user.id);

    const query = this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.items', 'item')
      .leftJoin('item.product', 'product')
      .leftJoin('product.store', 'productStore')
      .where(
        new Brackets((qb) => {
          qb.where('item.storeId = :storeId', { storeId: store.id }).orWhere(
            'item.storeId IS NULL AND productStore.id = :storeId',
            { storeId: store.id },
          );
        }),
      )
      .orderBy('order.createdAt', 'DESC')
      .addOrderBy('item.createdAt', 'ASC')
      .distinct(true);

    if (itemStatus) {
      query.andWhere('item.status = :itemStatus', { itemStatus });
    }

    return query.getMany();
  }

  async updateOrderItemStatusForSeller(
    user: UserWithoutPassword,
    orderItemId: string,
    body: UpdateOrderItemStatusDto,
  ): Promise<OrderItem> {
    const store = await this.getStoreForSeller(user.id);

    const item = await this.orderItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('product.store', 'productStore')
      .where('item.id = :orderItemId', { orderItemId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('item.storeId = :storeId', { storeId: store.id }).orWhere(
            'item.storeId IS NULL AND productStore.id = :storeId',
            { storeId: store.id },
          );
        }),
      )
      .getOne();

    if (!item) {
      throw new NotFoundException('Order item not found for this seller store');
    }

    item.status = body.status;
    return this.orderItemRepository.save(item);
  }

  private async getStoreForSeller(ownerId: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { owner: { id: ownerId } },
      select: { id: true },
    });

    if (!store) {
      throw new NotFoundException('Store does not exist!');
    }

    return store;
  }

  async getOrderById(id: string, user: UserWithoutPassword): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: {
        id,
        userId: user.id,
      },
      relations: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
