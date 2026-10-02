import { Module } from '@nestjs/common';
import { PaymentService } from '../../domain/orders/application/services/payment-service';
import { AbacatePayPaymentService } from './abacate-pay/abacate-pay-payment.service';

@Module({
  providers: [{ provide: PaymentService, useClass: AbacatePayPaymentService }],
  exports: [PaymentService],
})
export class PaymentsModule {}
