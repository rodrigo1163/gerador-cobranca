import { OrdersRepository } from "../../../../domain/orders/application/repositories/orders-repository";
import { Order } from "../../../../domain/orders/enterprise/entities/order";

export class PrismaOrdersRepository implements OrdersRepository {
  findById(id: string): Promise<Order | null> {
    throw new Error("Method not implemented.");
  }
  create(order: Order): Promise<void> {
    throw new Error("Method not implemented.");
  }
} 