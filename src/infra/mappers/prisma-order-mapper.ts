import { UniqueEntityId } from '../../core/entities/unique-entity-id';
import { Order } from '../../domain/orders/enterprise/entities/order';
import {
  Prisma,
  Order as PrismaOrder,
} from '../database/prisma/config/generated/client';

export class PrismaOrderMapper {
  static toDomain(raw: PrismaOrder): Order {
    return Order.create(
      {
        amountInCents: raw.amountInCents,
        status: raw.status,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toPrisma(order: Order): Prisma.OrderUncheckedCreateInput {
    return {
      id: order.id.toString(),
      amountInCents: order.amountInCents,
      status: order.status,
    };
  }
}
