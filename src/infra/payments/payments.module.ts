import { Module } from '@nestjs/common';
import { BoletoGateway } from '../../domain/orders/application/gateways/boleto-gateway';
import { PixGateway } from '../../domain/orders/application/gateways/pix-gateway';
import { AbacatePayClient } from './abacate-pay/abacate-pay-client';
import { AbacatePayPixGateway } from './abacate-pay/abacate-pay-pix.gateway';
import { AsaasBoletoGateway } from './asaas/asaas-boleto.gateway';
import { AsaasClient } from './asaas/asaas-client';

@Module({
  providers: [
    {
      provide: AsaasClient,
      useFactory: () => new AsaasClient(),
    },
    {
      provide: AbacatePayClient,
      useFactory: () => new AbacatePayClient(),
    },
    {
      provide: BoletoGateway,
      useClass: AsaasBoletoGateway,
    },
    {
      provide: PixGateway,
      useClass: AbacatePayPixGateway,
    },
  ],
  exports: [BoletoGateway, PixGateway],
})
export class PaymentsModule {}
