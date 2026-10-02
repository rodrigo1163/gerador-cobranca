import { Module } from '@nestjs/common';
import { OrderChargeLinksRepository } from '../../domain/orders/application/repositories/order-charge-links-repository';
import { OrdersRepository } from '../../domain/orders/application/repositories/orders-repository';
import { PrismaChargeLinksRepository } from './prisma/repositories/prisma-charge-links-repository';
import { PrismaOrdersRepository } from './prisma/repositories/prisma-orders-repository';
import { PrismaService } from './prisma/prisma.service';

@Module({
  providers: [
    PrismaService,
    { provide: OrdersRepository, useClass: PrismaOrdersRepository },
    {
      provide: OrderChargeLinksRepository,
      useClass: PrismaChargeLinksRepository,
    },
  ],
  exports: [PrismaService, OrdersRepository, OrderChargeLinksRepository],
})
export class DatabaseModule {}
