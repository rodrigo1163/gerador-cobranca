import {
  OrderChargeLink,
  OrderChargeLinksRepository,
} from '../../domain/orders/application/repositories/order-charge-links-repository'

export class InMemoryOrderChargeLinksRepository
  implements OrderChargeLinksRepository {
  public items: OrderChargeLink[] = []

  async create(link: OrderChargeLink) {
    this.items.push(link)
  }

  async findByOrderId(orderId: string) {
    return this.items.find((link) => link.orderId === orderId) ?? null
  }
}
