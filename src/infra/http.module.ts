import { Module } from '@nestjs/common';
import { GenerateOrderPixController } from './http/controllers/generate-order-pix.controller';
import { GenerateOrderPixUseCase } from '../domain/orders/application/use-cases/generate-order-pix.use-case';
import { OrderChargeLinksRepository } from '../domain/orders/application/repositories/order-charge-links-repository';
import { OrdersRepository } from '../domain/orders/application/repositories/orders-repository';
import { PaymentService } from '../domain/orders/application/services/payment-service';
import { DatabaseModule } from './database/database.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [DatabaseModule, PaymentsModule],
  controllers: [GenerateOrderPixController],
  providers: [
    {
      provide: GenerateOrderPixUseCase,
      useFactory: (
        orders: OrdersRepository,
        links: OrderChargeLinksRepository,
        payment: PaymentService,
      ) => new GenerateOrderPixUseCase(orders, links, payment),
      inject: [OrdersRepository, OrderChargeLinksRepository, PaymentService],
    },
  ],
})
export class HttpModule {}
