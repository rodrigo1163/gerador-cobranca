import { OrderChargeLink } from '../../domain/orders/enterprise/entities/value-objects/order-charge-link';
import {
  OrderChargeLink as PrismaOrderChargeLink,
  Prisma,
} from '../database/prisma/config/generated/client';

export class PrismaOrderChargeLinkMapper {
  static toDomain(raw: PrismaOrderChargeLink): OrderChargeLink {
    return OrderChargeLink.create({
      orderId: raw.orderId,
      chargeId: raw.chargeId,
      provider: raw.provider,
    });
  }

  static toPrisma(
    link: OrderChargeLink,
  ): Prisma.OrderChargeLinkUncheckedCreateInput {
    return {
      orderId: link.orderId,
      chargeId: link.chargeId,
      provider: link.provider,
    };
  }
}
