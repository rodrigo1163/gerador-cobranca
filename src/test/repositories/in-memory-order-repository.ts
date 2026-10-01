import { OrdersRepository } from '../../domain/orders/application/repositories/orders-repository'
import { Order } from '../../domain/orders/enterprise/entities/order'

export class InMemoryOrderRepository implements OrdersRepository {
  public items: Order[] = []

  async findById(id: string) {
    return this.items.find((order) => order.id.toString() === id) ?? null
  }

  async create(order: Order) {
    this.items.push(order)
  }
}
