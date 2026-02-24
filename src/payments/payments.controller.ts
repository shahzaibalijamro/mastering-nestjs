import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegisterSellerDto } from './dto/register-seller.dto';
import { UserWithoutPassword } from '../auth/interfaces/user.interface';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle({long: true, short: false})
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Register a seller and charge the Stripe registration fee',
  })
  @ApiBody({ type: RegisterSellerDto })
  registerSeller(@Body() body: RegisterSellerDto, @Req() req) {
    const user = req.user as UserWithoutPassword;
    return this.paymentsService.registerSeller(user, body);
  }
}
