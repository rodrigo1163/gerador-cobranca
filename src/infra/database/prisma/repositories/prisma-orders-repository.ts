import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../../../../domain/orders/application/repositories/orders-repository';
import { Order } from '../../../../domain/orders/enterprise/entities/order';
import { PrismaOrderMapper } from '../../../mappers/prisma-order-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) return null;

    return PrismaOrderMapper.toDomain(order);
  }

  async create(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: PrismaOrderMapper.toPrisma(order),
    });
  }
}
