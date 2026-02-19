import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import { RegisterSellerDto } from './dto/register-seller.dto';
import { PaymentsService } from './payments.service';

@Controller('api/sellers')
@ApiTags('Sellers')
export class SellersController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Register a seller and charge the Stripe registration fee',
  })
  @ApiBody({ type: RegisterSellerDto })
  async registerSeller(@Request() req, @Body() body: RegisterSellerDto) {
    // Frontend flow (become-a-seller/page.tsx):
    // 1) Client creates a Stripe PaymentMethod with card details.
    // 2) Client POSTs that paymentMethodId + seller info to this endpoint.
    // 3) Server confirms the payment and upgrades the user to SELLER.
    const user = req.user as UserWithoutPassword;
    return this.paymentsService.registerSeller(user, body);
  }
}
