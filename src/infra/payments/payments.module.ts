import { Module } from '@nestjs/common';
import { PaymentService } from '../../domain/orders/application/services/payment-service';
import { AbacatePayClient } from './abacate-pay/abacate-pay-client';
import { AbacatePayPaymentService } from './abacate-pay/abacate-pay-payment.service';
import { AsaasClient } from './asaas/asaas-client';
import { AsaasPaymentService } from './asaas/asaas-payment.service';

function createPaymentService(): PaymentService {
  const provider = (process.env.PAYMENT_PROVIDER ?? 'ABACATEPAY')
    .trim()
    .toUpperCase();

  switch (provider) {
    case 'ABACATEPAY':
      return new AbacatePayPaymentService(new AbacatePayClient());
    case 'ASAAS': {
      const customerId = process.env.ASAAS_CUSTOMER_ID?.trim();
      if (!customerId) {
        throw new Error(
          'ASAAS_CUSTOMER_ID is required when PAYMENT_PROVIDER=ASAAS',
        );
      }
      return new AsaasPaymentService(new AsaasClient(), customerId);
    }
    default:
      throw new Error(`Unsupported PAYMENT_PROVIDER: ${provider}`);
  }
}

@Module({
  providers: [{ provide: PaymentService, useFactory: createPaymentService }],
  exports: [PaymentService],
})
export class PaymentsModule { }
