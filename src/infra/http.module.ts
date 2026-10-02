import { Module } from '@nestjs/common';
import { GenerateOrderPixController } from './http/controllers/generate-order-pix.controller';
import { CreateOrderController } from './http/controllers/create-order.controller';
import { CreateOrderUseCase } from '../domain/orders/application/use-cases/create-order.use-case';
import { GenerateOrderPixUseCase } from '../domain/orders/application/use-cases/generate-order-pix.use-case';
import { DatabaseModule } from './database/database.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [DatabaseModule, PaymentsModule],
  controllers: [CreateOrderController, GenerateOrderPixController],
  providers: [CreateOrderUseCase, GenerateOrderPixUseCase],
})
export class HttpModule {}
