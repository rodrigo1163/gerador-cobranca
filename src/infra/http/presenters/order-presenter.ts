import type { Order } from '../../../domain/orders/enterprise/entities/order';

export class OrderPresenter {
  static toHTTP(order: Order) {
    return {
      id: order.id.toString(),
      amountInCents: order.amountInCents,
      status: order.status,
    };
  }
}
