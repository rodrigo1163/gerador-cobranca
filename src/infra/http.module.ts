import { Module } from '@nestjs/common';
import { GenerateOrderPixController } from './http/controllers/generate-order-pix.controller';
import { CreateOrderController } from './http/controllers/create-order.controller';
import { CreateOrderUseCase } from '../domain/orders/application/use-cases/create-order.use-case';
import { GenerateOrderPixUseCase } from '../domain/orders/application/use-cases/generate-order-pix.use-case';
import { DatabaseModule } from './database/database.module';
import { PaymentsModule } from './payments/payments.module';
import { GenerateOrderBoletoController } from './http/controllers/generate-order-boleto.controller';
import { GenerateOrderBoletoUseCase } from '../domain/orders/application/use-cases/generate-order-boleto.use-case';

@Module({
  imports: [DatabaseModule, PaymentsModule],
  controllers: [
    CreateOrderController,
    GenerateOrderPixController,
    GenerateOrderBoletoController,
  ],
  providers: [
    CreateOrderUseCase,
    GenerateOrderPixUseCase,
    GenerateOrderBoletoUseCase,
  ],
})
export class HttpModule {}
