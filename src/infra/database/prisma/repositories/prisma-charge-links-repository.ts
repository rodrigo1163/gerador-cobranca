import { Injectable } from '@nestjs/common';
import { OrderChargeLinksRepository } from '../../../../domain/orders/application/repositories/order-charge-links-repository';
import { OrderChargeLink } from '../../../../domain/orders/enterprise/entities/value-objects/order-charge-link';
import { PrismaOrderChargeLinkMapper } from '../../../mappers/prisma-order-charge-link-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaChargeLinksRepository implements OrderChargeLinksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(link: OrderChargeLink): Promise<void> {
    await this.prisma.orderChargeLink.create({
      data: PrismaOrderChargeLinkMapper.toPrisma(link),
    });
  }

  async findByOrderId(orderId: string): Promise<OrderChargeLink | null> {
    const link = await this.prisma.orderChargeLink.findUnique({
      where: { orderId },
    });

    if (!link) return null;

    return PrismaOrderChargeLinkMapper.toDomain(link);
  }
}
