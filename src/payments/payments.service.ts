import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RegisterSellerDto } from './dto/register-seller.dto';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Store } from 'src/store/entities/store.entity';
import { Payment } from './entities/payment.entity';
import { UserWithoutPassword } from 'src/auth/interfaces/user.interface';
import { UserService } from 'src/user/user.service';
import { StoreService } from 'src/store/store.service';

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

    const payment = this.paymentRepository.create({
      stripePaymentIntentId: paymentIntent.id,
      amount: this.registrationFeeAmount,
      currency: this.registrationFeeCurrency,
      status: paymentIntent.status,
      user: dbUser,
    });
    await this.paymentRepository.save(payment);

    return {
      message: 'Seller registration completed',
      paymentIntentId: paymentIntent.id,
    };
  }

  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
