import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RegisterSellerDto } from './dto/register-seller.dto';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { Payment, PaymentPurpose } from './entities/payment.entity';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import { UserService } from '../user/user.service';
import { StoreService } from '../store/store.service';
import { Order } from '../orders/entities/order.entity';

interface ChargeOrderParams {
  amountInCents: number;
  currency: string;
  paymentMethodId: string;
  user: UserWithoutPassword;
}

interface RecordPaymentParams {
  paymentIntent: Stripe.PaymentIntent;
  user: UserWithoutPassword;
  purpose: PaymentPurpose;
  order?: Order;
}

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly registrationFeeAmount = 10000; // $100.00 in cents
  private readonly registrationFeeCurrency = 'usd';

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly storeService: StoreService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not defined');
    }
    this.stripe = new Stripe(secretKey);
  }

  async registerSeller(user: UserWithoutPassword, body: RegisterSellerDto) {
    console.log(user);
    console.log(body);

    // Guard rails: prevent duplicate seller registrations.
    if (user.role === UserRole.SELLER) {
      throw new BadRequestException('User is already a seller');
    }

    await this.storeService.confirmNotSeller(user.id);

    await this.storeService.confirmStoreNameIsUnique(body.storeName);

    // Create and confirm the Stripe payment in one step using the client-side
    // PaymentMethod id sent from the frontend.
    let paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
    try {
      paymentIntent = await this.stripe.paymentIntents.create({
        amount: this.registrationFeeAmount,
        currency: this.registrationFeeCurrency,
        payment_method: body.stripePaymentMethodId,
        confirm: true,
        description: `Seller registration for user ${user.id}`,
        metadata: {
          userId: user.id,
          storeName: body.storeName,
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Payment failed. Please try another card.');
    }

    if (paymentIntent.status !== 'succeeded') {
      // The frontend currently does not handle 3DS or other follow-up actions,
      // so we only proceed on success.
      throw new BadRequestException(
        'Payment was not completed. Please try another card.',
      );
    }

    const dbUser = await this.userService.updateUserRole(UserRole.SELLER, user);
    // have to remove the store repository from here, and use only storeService

    await this.storeService.createStore({
      name: body.storeName,
      description: body.storeAddress,
      address: body.storeAddress,
      phoneNumber: body.phoneNumber,
      idCardNumber: body.idCardNumber,
      owner: dbUser,
    });

    await this.recordPayment({
      paymentIntent,
      user: dbUser,
      purpose: PaymentPurpose.SELLER_REGISTRATION,
    });

    return {
      message: 'Seller registration completed',
      paymentIntentId: paymentIntent.id,
    };
  }

  async chargeOrder(params: ChargeOrderParams) {
    const { amountInCents, currency, paymentMethodId, user } = params;

    if (amountInCents <= 0) {
      throw new BadRequestException('Charge amount must be greater than zero');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        payment_method: paymentMethodId,
        confirm: true,
        description: `Order charge for user ${user.id}`,
        metadata: {
          userId: user.id,
          purpose: PaymentPurpose.ORDER,
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException(
          'Payment was not completed. Please try another card.',
        );
      }

      return paymentIntent;
    } catch (error) {
      throw new BadRequestException('Payment failed. Please try another card.');
    }
  }

  async recordPayment(params: RecordPaymentParams) {
    const { paymentIntent, user, purpose, order } = params;

    const payment = this.paymentRepository.create({
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      user: { id: user.id } as User,
      purpose,
      order,
    });

    await this.paymentRepository.save(payment);

    return payment;
  }
}
