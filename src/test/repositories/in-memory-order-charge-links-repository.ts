import {
  OrderChargeLink,
  OrderChargeLinksRepository,
  PaymentMethod,
} from '../../domain/orders/application/repositories/order-charge-links-repository';

export class InMemoryOrderChargeLinksRepository implements OrderChargeLinksRepository {
  public items: OrderChargeLink[] = [];

  create(link: OrderChargeLink): Promise<void> {
    this.items.push(link);
    return Promise.resolve();
  }

  findByOrderAndMethod(
    orderId: string,
    method: PaymentMethod,
  ): Promise<OrderChargeLink | null> {
    return Promise.resolve(
      this.items.find(
        (link) => link.orderId === orderId && link.method === method,
      ) ?? null,
    );
  }
}
