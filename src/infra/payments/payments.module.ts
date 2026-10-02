import { Module } from '@nestjs/common';
import { PaymentService } from '../../domain/orders/application/services/payment-service';
import { AsaasPaymentService } from './asaas/asaas-payment.service';

@Module({
  providers: [{ provide: PaymentService, useClass: AsaasPaymentService }],
  exports: [PaymentService],
})
export class PaymentsModule { }
